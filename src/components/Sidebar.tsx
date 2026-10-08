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
  MapIcon,
  WrenchIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabaseBrowser';
import { useState, useEffect, useMemo } from 'react';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

const navItems = [
  { href: '/dashboard', label: 'ACCUEIL', icon: HomeIcon },
  { href: '/collection', label: 'MA COLLECTION', icon: Layers3Icon },
  { href: '/boosters', label: 'BOUTIQUE PACKS', icon: ZapIcon },
  { href: '/marketplace', label: 'MARKETPLACE', icon: ShoppingBagIcon },
  { href: '/missions', label: 'CONTRATS', icon: TrophyIcon },
  { href: '/profile', label: 'PROFIL PILOTE', icon: UserIcon },
  { href: '/settings', label: 'RÉGLAGES', icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useSitePreferences();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthLoaded(true);
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted && !authEventReceived) {
        setUser(user);
        setAuthLoaded(true);
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

  return (
    <aside className="w-[280px] h-screen bg-[#080808] border-r border-white/5 p-8 flex flex-col gap-10 sticky top-0 z-50">
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
      <nav className="flex flex-col gap-2 flex-1">
        {[...navItems, ...(user ? [
          { href: '/admin/cards', label: 'ATELIER CARTES', icon: WrenchIcon },
          { href: '/admin/circuits', label: 'ATELIER CIRCUITS', icon: MapIcon },
        ] : [])].map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
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
  );
}