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
    ? [...adminItems, { href: '/admin/access', label: 'GESTION DES ACCÈS', icon: ShieldCheckIcon }]
    : adminItems;

  return (
    <>

      <aside className="paddock-sidebar sticky top-0 z-50 hidden h-screen w-[228px] shrink-0 flex-col md:flex 2xl:w-[252px]">
        <Link href="/dashboard" className="relative block overflow-hidden border-b border-white/10 px-5 pb-7 pt-8" aria-label="Apex Collector">
          <div className="pointer-events-none absolute -left-10 top-16 h-28 w-48 rounded-full bg-red-600/10 blur-[55px]" />
          <span className="relative flex items-center gap-3">
            <span aria-hidden="true" className="relative mt-1 inline-flex h-10 w-11 shrink-0 skew-x-[-20deg] flex-col gap-1.5">
              <span className="block h-2.5 w-full bg-[#f13b57] shadow-[0_0_17px_rgba(238,49,76,.45)]"/>
              <span className="ml-2 block h-2.5 w-[70%] bg-[#ba1c48]"/>
            </span>
            <span className="font-['Barlow_Condensed'] text-[33px] font-black italic uppercase leading-[.66] tracking-[-.065em] text-white">
              APEX <span className="mt-2 block text-[25px] tracking-[-.025em]">COLLECTOR</span>
            </span>
          </span>
          <div className="mt-6 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.15em] text-slate-500">
            <span className="h-[2px] w-7 rounded-full bg-[#ed344f]"/>
            {t('Season One')}
          </div>
        </Link>
        <nav aria-label={t('Navigation principale')} className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(href);
            const locked = authLoaded && !user && href !== '/login';
            return (
              <Link
                key={href}
                href={locked ? '/login' : href}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex min-h-[46px] items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${active
                  ? 'border-[#8a86ff]/60 bg-gradient-to-r from-[#324b94]/75 via-[#302a66]/80 to-[#161c36] text-white shadow-[0_0_17px_rgba(99,111,255,.23),inset_0_1px_0_rgba(255,255,255,.18)]'
                  : locked
                    ? 'border-transparent text-slate-600 opacity-60'
                    : 'border-transparent text-[#acb6d1] hover:border-white/10 hover:bg-[#1b2845]/65 hover:text-white'
                }`}
              >
                {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#65b8ff] shadow-[0_0_9px_rgba(80,161,255,.8)]" />}
                <Icon size={20} className={active ? 'shrink-0 text-[#bdc8ff]' : 'shrink-0 text-[#8795b4] group-hover:text-white'} aria-hidden="true"/>
                <span className="min-w-0 flex-1 text-[12px] font-bold tracking-[.01em]">{t(label)}</span>
                {locked && <LockIcon size={13} aria-hidden="true" />}
              </Link>
            );
          })}
          {isAdmin && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <button
                type="button"
                aria-expanded={adminMenuOpen}
                onClick={() => setAdminMenuOpen((open) => !open)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-bold transition ${pathname.startsWith('/admin/') ? 'bg-[#233c70] text-white' : 'text-[#b1bcd7] hover:bg-white/10 hover:text-white'}`}
              >
                <ShieldCheckIcon size={19} aria-hidden="true" />
                <span className="flex-1">{t('ADMIN')}</span>
                <ChevronDownIcon size={15} className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true"/>
              </button>
              {adminMenuOpen && (
                <div className="mt-1 space-y-1 pl-3">
                  {visibleAdminItems.map(({ href, label, icon: Icon }) => {
                    const active = isActivePath(href);
                    return (
                      <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                        className={`flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold ${active ? 'bg-[#354b93]/55 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                        <Icon size={17} aria-hidden="true"/><span>{t(label)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
        {authLoaded && (
          <div className="relative overflow-hidden border-t border-white/10 bg-[#0e1730]/75 px-4 py-5">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-indigo-600/20 blur-3xl"/>
            <div className="relative flex items-center gap-3">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#8ba9ef]/30 bg-[#2c385d] text-[#c3d5ff]">
                <UserIcon size={21}/>
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#95a4cf]">{t('PROFIL PILOTE')}</p>
                {user ? (
                  <Link href="/profile" className="block truncate text-[11px] font-bold text-white hover:text-[#8bd5ff]" title={user.email || undefined}>
                    {user.email || t('PROFIL PILOTE')}
                  </Link>
                ) : (
                  <Link href="/login" className="text-xs font-bold text-[#8bd5ff] hover:text-white">{t('Se Connecter')}</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[55] md:hidden">
          <button type="button" aria-label={t('Fermer le menu')} onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/75" />
          <nav id="apex-mobile-more-menu" aria-label={t('Navigation secondaire')} className="paddock-mobile-sheet absolute inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] max-h-[75dvh] overflow-y-auto p-3">
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <span className="text-sm font-black uppercase tracking-widest">{t('Plus')}</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label={t('Fermer le menu')} className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89bbff]">
                <XIcon size={22} />
              </button>
            </div>
            {extraItems.map(({ href, label, icon: Icon }) => {
              const active = isActivePath(href);
              const locked = authLoaded && !user;
              return (
                <Link key={href} href={locked ? '/login' : href} aria-current={active ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89bbff] ${active ? 'bg-[#586cef]/15 text-[#F0EFEB]' : 'text-gray-200 hover:bg-white/10'}`}>
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
                          className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-2 text-sm font-bold ${active ? 'bg-[#586cef]/15 text-[#F0EFEB]' : 'text-gray-300 hover:bg-white/10'}`}
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

      <nav aria-label={t('Navigation principale')} className="paddock-mobile-nav fixed inset-x-0 bottom-0 z-[60] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-stretch px-1">
          {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
            const active = isActivePath(href);
            const locked = authLoaded && !user;
            const shortLabel = label === 'ACCUEIL' ? 'Accueil' : label === 'MA COLLECTION' ? 'Collection' : label === 'BOUTIQUE PACKS' ? 'Boosters' : 'Marché';
            return (
              <Link key={href} href={locked ? '/login' : href} aria-current={active ? 'page' : undefined}
                className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89bbff] ${active ? 'text-[#F0EFEB]' : 'text-[#A8ADB3]'}`}>
                {active && <span className="absolute -top-[3px] left-4 right-4 h-[3px] bg-[#586cef]" aria-hidden="true" />}
                <Icon size={22} strokeWidth={active ? 2.6 : 1.75} aria-hidden="true" />
                <span className="truncate">{t(shortLabel)}</span>
              </Link>
            );
          })}
          <button type="button" aria-label={t('Plus')} aria-controls="apex-mobile-more-menu" aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89bbff] ${mobileMenuOpen || extraItems.some(({ href }) => isActivePath(href)) || (isAdmin && pathname.startsWith('/admin/')) ? 'text-[#F0EFEB]' : 'text-[#A8ADB3]'}`}>
            <MenuIcon size={21} aria-hidden="true" />
            <span>{t('Plus')}</span>
          </button>
        </div>
      </nav>

    </>
  );
}