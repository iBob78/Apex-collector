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
      <aside className="paddock-sidebar sticky top-0 z-50 hidden h-screen w-[264px] shrink-0 flex-col md:flex lg:w-[280px]">
        <Link href="/dashboard" className="group relative block overflow-hidden border-b border-white/20 px-5 pb-7 pt-8">
          <span className="absolute -right-8 -top-12 h-40 w-24 skew-x-[-25deg] bg-[#D32F35]/[.07]" aria-hidden="true"/>
          <div className="mb-5 flex items-center gap-2 font-['Barlow_Condensed'] text-[11px] font-extrabold uppercase tracking-[.2em] text-[#F0EFEB]">
            <span className="h-[7px] w-[7px] bg-[#D32F35]" /> RACING DEPARTMENT
          </div>
          <h1 className="font-['Barlow_Condensed'] text-[60px] font-black uppercase leading-[.7] tracking-[-.065em] text-white transition group-hover:text-[#F0EFEB]">
            APEX<span className="mt-2 block text-[49px] tracking-[-.045em] text-[#F0EFEB] group-hover:text-white">COLLECTOR</span>
          </h1>
          <div className="mt-6 flex items-center gap-2 border-t border-white/20 pt-3">
            <span className="h-[2px] w-6 bg-[#D32F35]" />
            <span className="font-mono text-[10px] uppercase tracking-[.1em] text-gray-400">{t('Season One')} / AC-001</span>
          </div>
        </Link>
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-4 font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.17em]">
          <span className="text-gray-400">MAIN / NAVIGATION</span><span className="text-[#F0EFEB]">10 SECTORS</span>
        </div>
        <nav aria-label={t('Navigation principale')} className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
          {navItems.map(({ href, label, icon: Icon }, index) => {
            const active = isActivePath(href);
            const locked = authLoaded && !user && href !== '/login';
            return (
              <Link key={href} href={locked ? '/login' : href} aria-current={active ? 'page' : undefined}
                className={`group relative flex min-h-[47px] items-center gap-3 border-l-[3px] px-3 py-2 transition-colors ${active
                  ? 'border-[#D32F35] bg-[#D32F35] text-[#F0EFEB]'
                  : locked ? 'border-transparent text-gray-600 opacity-60'
                    : 'border-transparent text-[#C2C5C9] hover:border-[#D32F35] hover:bg-white/[.07] hover:text-white'
                  }`}>
                <span className={`w-[21px] shrink-0 font-mono text-[10px] font-bold ${active ? 'text-[#F0EFEB]' : 'text-gray-600 group-hover:text-[#F0EFEB]'}`}>{String(index + 1).padStart(2, '0')}</span>
                <Icon size={18} className="shrink-0" aria-hidden="true"/>
                <span className="min-w-0 flex-1 font-['Barlow_Condensed'] text-[14px] font-extrabold uppercase tracking-[.06em]">{t(label)}</span>
                {locked ? <LockIcon size={13} aria-hidden="true" /> : active ? <span className="h-2 w-2 rotate-45 bg-[#D32F35]" aria-hidden="true" /> : null}
              </Link>
            );
          })}
          {isAdmin && (
            <div className="mt-3 border-t border-white/20 pt-3">
              <button type="button" aria-expanded={adminMenuOpen} onClick={() => setAdminMenuOpen((open) => !open)}
                className={`flex min-h-11 w-full items-center gap-3 border-l-[3px] px-3 py-2 text-left font-['Barlow_Condensed'] text-[14px] font-extrabold uppercase tracking-[.09em] transition ${pathname.startsWith('/admin/') ? 'border-[#D32F35] text-[#F0EFEB]' : 'border-transparent text-gray-400 hover:text-white'}`}>
                <ShieldCheckIcon size={18} aria-hidden="true"/><span className="flex-1">{t('ADMIN')}</span>
                <ChevronDownIcon size={16} className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true"/>
              </button>
              {adminMenuOpen && (
                <div className="mt-1 space-y-1 pl-4">
                  {visibleAdminItems.map(({ href, label, icon: Icon }) => {
                    const active = isActivePath(href);
                    return <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                      className={`flex min-h-10 items-center gap-3 border-l-2 px-3 py-2 font-['Barlow_Condensed'] text-[12px] font-bold uppercase tracking-[.04em] ${active ? 'border-[#D32F35] bg-white/10 text-[#F0EFEB]' : 'border-transparent text-gray-400 hover:border-white/30 hover:text-white'}`}>
                      <Icon size={16} aria-hidden="true"/><span>{t(label)}</span>
                    </Link>;
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
        {!authLoaded ? null : user ? (
          <Link href="/profile" className="group block border-t border-white/20 bg-[#232930] px-5 py-5 transition-colors hover:bg-[#26301e]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.16em] text-[#F0EFEB]">DRIVER / IDENTITY</span>
              <CrownIcon size={17} className="text-[#F0EFEB]" aria-hidden="true"/>
            </div>
            <p className="truncate font-mono text-[11px] text-white" title={user.email || undefined}>{user.email || t('PROFIL PILOTE')}</p>
            <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2 font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.1em] text-gray-400">
              <span>{t('PROFIL PILOTE')}</span><span className="text-[#F0EFEB] transition-transform group-hover:translate-x-1">↗</span>
            </div>
          </Link>
        ) : (
          <Link href="/login" className="m-3 flex min-h-12 items-center justify-center bg-[#D32F35] px-3 font-['Barlow_Condensed'] text-[15px] font-black uppercase tracking-[.1em] text-[#F0EFEB] transition hover:bg-white">
            {t('Se Connecter')}
          </Link>
        )}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[55] md:hidden">
          <button type="button" aria-label={t('Fermer le menu')} onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/75" />
          <nav id="apex-mobile-more-menu" aria-label={t('Navigation secondaire')} className="paddock-mobile-sheet absolute inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] max-h-[75dvh] overflow-y-auto p-3">
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <span className="text-sm font-black uppercase tracking-widest">{t('Plus')}</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label={t('Fermer le menu')} className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F35]">
                <XIcon size={22} />
              </button>
            </div>
            {extraItems.map(({ href, label, icon: Icon }) => {
              const active = isActivePath(href);
              const locked = authLoaded && !user;
              return (
                <Link key={href} href={locked ? '/login' : href} aria-current={active ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F35] ${active ? 'bg-[#D32F35]/15 text-[#F0EFEB]' : 'text-gray-200 hover:bg-white/10'}`}>
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
                          className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-2 text-sm font-bold ${active ? 'bg-[#D32F35]/15 text-[#F0EFEB]' : 'text-gray-300 hover:bg-white/10'}`}
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
                className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F35] ${active ? 'text-[#F0EFEB]' : 'text-[#A8ADB3]'}`}>
                {active && <span className="absolute -top-[3px] left-4 right-4 h-[3px] bg-[#D32F35]" aria-hidden="true" />}
                <Icon size={22} strokeWidth={active ? 2.6 : 1.75} aria-hidden="true" />
                <span className="truncate">{t(shortLabel)}</span>
              </Link>
            );
          })}
          <button type="button" aria-label={t('Plus')} aria-controls="apex-mobile-more-menu" aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F35] ${mobileMenuOpen || extraItems.some(({ href }) => isActivePath(href)) || (isAdmin && pathname.startsWith('/admin/')) ? 'text-[#F0EFEB]' : 'text-[#A8ADB3]'}`}>
            <MenuIcon size={21} aria-hidden="true" />
            <span>{t('Plus')}</span>
          </button>
        </div>
      </nav>

    </>
  );
}