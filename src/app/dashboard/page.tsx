'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { PACKS } from '@/lib/boosters';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalCards: 0, uniqueCards: 0 });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchStats(data.user.id);
        fetchProfile(data.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('ap')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const fetchStats = async (userId: string) => {
    const { data } = await supabase
      .from('user_cards')
      .select('count')
      .eq('user_id', userId);

    if (data) {
      const total = data.reduce((acc, curr) => acc + curr.count, 0);
      setStats({
        totalCards: total,
        uniqueCards: data.length
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header section with User Profile Link */}
          <div className="mb-7 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                {t('Tableau de bord')}
              </h1>
              <p className="text-gray-500 mt-1">{t('Gérez votre écurie et vos actifs.')}</p>
            </div>
            {user && (
              <button
                onClick={() => router.push('/profile')}
                className="flex min-h-11 items-center gap-3 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 transition-all hover:bg-white/10 sm:self-auto"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white uppercase tracking-widest">{user.email?.split('@')[0]}</span>
                  <span className="text-[10px] text-blue-400 font-bold tracking-wider">▲ {profile?.ap || 0} AP</span>
                </div>
              </button>
            )}
          </div>

          {/* Stats Overview */}
          <div className="mb-9 grid grid-cols-2 gap-3 sm:mb-12 sm:gap-6 lg:grid-cols-4">
            <StatCard label={t('Cartes totales')} value={stats.totalCards} sub={t('Dans votre collection')} color="blue" />
            <StatCard label={t('Modèles uniques')} value={stats.uniqueCards} sub={t('Garage distinct')} color="purple" />
            <StatCard label={t('Balance AP')} value={profile?.ap || 0} sub={t('Disponibles')} color="green" />
            <StatCard label={t('Niveau écurie')} value={Math.floor(stats.uniqueCards / 10) + 1} sub={t('Prochaine récompense à +5')} color="orange" />
          </div>

          {/* Featured Boosters Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">{t('Boosters Populaires')}</h2>
              <button
                onClick={() => router.push('/boosters')}
                className="text-blue-400 text-sm hover:underline"
              >
                {t('Voir toute la boutique')}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
              {Object.values(PACKS).map((pack) => (
                <div
                  key={pack.slug}
                  onClick={() => router.push('/boosters')}
                  className="group relative cursor-pointer"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${pack.color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500`}></div>
                  <div className="relative flex min-h-20 items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10 sm:p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${pack.color} flex items-center justify-center text-xl`}>
                      🎁
                    </div>
                    <div>
                      <h3 className="font-bold">{pack.name}</h3>
                      <p className="text-xs text-gray-500 font-mono">▲ {pack.price} Crédits</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity / Tips */}
          <div className="rounded-r-xl border-l-4 border-blue-500 bg-gradient-to-r from-blue-900/20 to-transparent p-4 sm:p-6">
            <h3 className="font-bold mb-2">{t('Conseil du jour')}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('Les cartes de rareté')} <span className="text-yellow-400">Legend</span> {t('Il y a 20% de chance dans le')} Pack Légendaire.
              {t('N’oubliez pas d’échanger vos doublons au marché pour optimiser votre progression.')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, color }: any) {
  const colors: any = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    green: 'from-green-500/20 to-green-500/5 border-green-500/20',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20',
  };

  return (
    <div className={`min-w-0 rounded-2xl border bg-gradient-to-br p-3 sm:p-6 ${colors[color]}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <p className="mb-2 break-words font-mono text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
  );
}