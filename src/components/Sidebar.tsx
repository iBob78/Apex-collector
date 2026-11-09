'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ShoppingBagIcon,
  ZapIcon,
  TrophyIcon,
  SettingsIcon,
  UserIcon,
  Layers3Icon,
  CrownIcon,
  LockIcon,
  MenuIcon,
  XIcon,
  MapIcon,
  WrenchIcon,
  StarIcon,
  ClipboardListIcon,
  AwardIcon,
  MedalIcon,
  LightbulbIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabaseBrowser';
import { useState, useEffect, useMemo } from 'react';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import { updateQuestProgress } from '@/lib/actions/objectives';
import { getAdminNavigationAccess } from '@/app/admin/navigation-actions';

const adminItems = [
  { href: '/admin/cards', label: 'ATELIER CARTES', icon: WrenchIcon },
  { href: '/admin/circuits', label: 'ATELIER CIRCUITS', icon: MapIcon },
  { href: '/admin/drivers', label: 'ATELIER PILOTES', icon: AwardIcon },
  { href: '/admin/objectives', label: 'CONTRATS & SUCCÈS', icon: ClipboardListIcon },
  { href: '/admin/suggestions', label: 'BOÎTE DE RÉCEPTION', icon: LightbulbIcon },
];

const navItems = [
  { href: '/dashboard', label: 'ACCUEIL', icon: HomeIcon },
  { href: '/collection', label: 'MA COLLECTION', icon: Layers3Icon },
  { href: '/boosters', label: 'BOUTIQUE PACKS', icon: ZapIcon },
  { href: '/marketplace', label: 'MARKETPLACE', icon: ShoppingBagIcon },
  { href: '/leaderboard', label: 'CLASSEMENT', icon: MedalIcon },
  { href: '/missions', label: 'CONTRATS', icon: TrophyIcon },
  { href: '/achievements', label: 'Succès', icon: StarIcon },
  { href: '/profile', label: 'PROFIL PILOTE', icon: UserIcon },
  { href: '/settings', label: 'RÉGLAGES', icon: SettingsIcon },
  { href: '/suggestions', label: 'SUGGÉRER UNE CARTE', icon: LightbulbIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useSitePreferences();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthLoaded(true);
      if ((_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') && session?.user) {
        window.setTimeout(() => void updateQuestProgress(session.user.id, 'daily_login'), 0);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted && !authEventReceived) {
        setUser(user);
        setAuthLoaded(true);
        if (user) void updateQuestProgress(user.id, 'daily_login');
      }
    }).catch(() => {
      if (mounted && !authEventReceived) {
        setUser(null);
        setAuthLoaded(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let active = true;
    setIsAdmin(false);
    setIsOwner(false);

    if (!user?.id) return () => { active = false; };

    getAdminNavigationAccess()
      .then((access) => {
        if (active && access.userId === user.id) {
          setIsAdmin(access.isAdmin);
          setIsOwner(access.isOwner);
        }
      })
      .catch((error: unknown) => {
        console.error('[Sidebar] Vérification de l’accès administrateur impossible:', error);
      });

    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    document.body.classList.add('apex-mobile-app');
    return () => document.body.classList.remove('apex-mobile-app');
  }, []);

  useEffect(() => setMobileMenuOpen(false), [pathname]);
  useEffect(() => setAdminMenuOpen(pathname.startsWith('/admin/')), [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const isActivePath = (href: string) =>
    pathname === href || pathname.startsWith(href + '/') || (href === '/boosters' && pathname === '/open');

  const extraItems = navItems.slice(4);
  const visibleAdminItems = isOwner
    ? [...adminItems, { href: '/admin/access', label: 'GESTION DES ACCÈS', icon: ShieldCheckIcon }, { href: '/admin/players', label: 'GESTION DES JOUEURS', icon: UsersIcon }]
    : adminItems;

  return (
    <>
      <aside className="hidden w-[280px] shrink-0 h-screen bg-[#080808] border-r border-white/5 p-8 flex-col gap-10 sticky top-0 z-50 md:flex">
      {/* Brand Logo */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
          Apex <span className="text-blue-500">Collector</span>
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-gray-500 uppercase">{t('Season One')}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = isActivePath(href);
          const isLocked = authLoaded && !user && href !== '/login';

          return (
            <Link
              key={href}
              href={isLocked ? '/login' : href}
              className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                ? 'bg-blue-500/10 text-white'
                : isLocked
                  ? 'text-gray-700 cursor-not-allowed opacity-50'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-6 bg-blue-500 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <Icon size={20} className={`transition-colors ${isActive ? 'text-blue-500' : isLocked ? 'text-gray-800' : 'group-hover:text-blue-400'}`} />
              <span className="text-xs font-black tracking-widest uppercase">{t(label)}</span>

              {isLocked && (
                <LockIcon size={12} className="ml-auto text-gray-800" />
              )}

              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]" />
              )}
            </Link>
          );
        })}
        {isAdmin && (
          <div className="mt-2 border-t border-white/[0.08] pt-3">
            <button
              type="button"
              aria-expanded={adminMenuOpen}
              onClick={() => setAdminMenuOpen((open) => !open)}
              className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-all ${pathname.startsWith('/admin/') ? 'bg-blue-500/10 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
            >
              <ShieldCheckIcon size={20} className={pathname.startsWith('/admin/') ? 'text-blue-500' : 'group-hover:text-blue-400'} />
              <span className="flex-1 text-xs font-black tracking-widest">{t('ADMIN')}</span>
              <ChevronDownIcon size={16} className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {adminMenuOpen && (
              <div className="mt-1 space-y-1 pl-3">
                {visibleAdminItems.map(({ href, label, icon: Icon }) => {
                  const active = isActivePath(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold transition ${active ? 'bg-blue-500/10 text-blue-300' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Icon size={16} aria-hidden="true" />
                      <span>{t(label)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Pilot Stats Mini Card */}
      {!authLoaded ? null : user ? (
        <div className="mt-auto p-4 bg-gradient-to-br from-[#111] to-black rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <CrownIcon size={18} className="text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-tighter text-gray-500 font-bold">{t('Rang Actuel')}</div>
              <div className="text-sm font-black uppercase italic tracking-tighter">{t('Écurie Platine')}</div>
            </div>
          </div>

          <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[65%] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </div>
          <div className="flex justify-between mt-2 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
            <span>{t('XP PILOTE')}</span>
            <span>65%</span>
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          className="mt-auto p-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl border border-blue-500/30 text-center transition-all shadow-xl shadow-blue-500/20 group"
        >
          <div className="text-xs font-black uppercase tracking-[0.2em]">{t('Se Connecter')}</div>
          <div className="text-[9px] font-medium opacity-70 mt-1">{t('Rejoignez l\'élite Apex')}</div>
        </Link>
      )}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[55] md:hidden">
          <button type="button" aria-label={t('Fermer le menu')} onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/75" />
          <nav id="apex-mobile-more-menu" aria-label={t('Navigation secondaire')} className="absolute inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] max-h-[75dvh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0e111a] p-3 shadow-2xl">
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <span className="text-sm font-black uppercase tracking-widest">{t('Plus')}</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label={t('Fermer le menu')} className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                <XIcon size={22} />
              </button>
            </div>
            {extraItems.map(({ href, label, icon: Icon }) => {
              const active = isActivePath(href);
              const locked = authLoaded && !user;
              return (
                <Link key={href} href={locked ? '/login' : href} aria-current={active ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${active ? 'bg-blue-500/15 text-blue-300' : 'text-gray-200 hover:bg-white/10'}`}>
                  <Icon size={20} aria-hidden="true" />
                  <span>{t(label)}</span>
                  {locked && <LockIcon className="ml-auto text-gray-500" size={15} aria-hidden="true" />}
                </Link>
              );
            })}
            {isAdmin && (
              <div className="mt-2 border-t border-white/10 pt-2">
                <button
                  type="button"
                  aria-expanded={adminMenuOpen}
                  onClick={() => setAdminMenuOpen((open) => !open)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-200 hover:bg-white/10"
                >
                  <ShieldCheckIcon size={20} aria-hidden="true" />
                  <span className="flex-1">{t('ADMIN')}</span>
                  <ChevronDownIcon size={16} className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {adminMenuOpen && (
                  <div className="space-y-1 pl-4">
                    {visibleAdminItems.map(({ href, label, icon: Icon }) => {
                      const active = isActivePath(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-2 text-sm font-bold ${active ? 'bg-blue-500/15 text-blue-300' : 'text-gray-300 hover:bg-white/10'}`}
                        >
                          <Icon size={18} aria-hidden="true" />
                          <span>{t(label)}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      )}

      <nav aria-label={t('Navigation principale')} className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#080b11]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_25px_rgba(0,0,0,0.35)] backdrop-blur-lg md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-stretch px-1">
          {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
            const active = isActivePath(href);
            const locked = authLoaded && !user;
            const shortLabel = label === 'ACCUEIL' ? 'Accueil' : label === 'MA COLLECTION' ? 'Collection' : label === 'BOUTIQUE PACKS' ? 'Boosters' : 'Marché';
            return (
              <Link key={href} href={locked ? '/login' : href} aria-current={active ? 'page' : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[10px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${active ? 'text-blue-400' : 'text-gray-400'}`}>
                <Icon size={21} aria-hidden="true" />
                <span className="truncate">{t(shortLabel)}</span>
              </Link>
            );
          })}
          <button type="button" aria-label={t('Plus')} aria-controls="apex-mobile-more-menu" aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[10px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${mobileMenuOpen || extraItems.some(({ href }) => isActivePath(href)) || (isAdmin && pathname.startsWith('/admin/')) ? 'text-blue-400' : 'text-gray-400'}`}>
            <MenuIcon size={21} aria-hidden="true" />
            <span>{t('Plus')}</span>
          </button>
        </div>
      </nav>

    </>
  );
}