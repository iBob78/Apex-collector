'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { PACKS } from '@/lib/boosters';

export default function DashboardPage() {
  const router = useRouter();
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
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-8 flex-1 overflow-y-auto">
          {/* Header section with User Profile Link */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Tableau de bord
              </h1>
              <p className="text-gray-500 mt-1">Gérez votre écurie et vos actifs.</p>
            </div>
            {user && (
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all group"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard label="Cartes totales" value={stats.totalCards} sub="Dans votre collection" color="blue" />
            <StatCard label="Modèles uniques" value={stats.uniqueCards} sub="Garage distinct" color="purple" />
            <StatCard label="Balance AP" value={profile?.ap || 0} sub="Disponibles" color="green" />
            <StatCard label="Niveau écurie" value={Math.floor(stats.uniqueCards / 10) + 1} sub="Prochaine récompense à +5" color="orange" />
          </div>

          {/* Featured Boosters Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">Boosters Populaires</h2>
              <button
                onClick={() => router.push('/boosters')}
                className="text-blue-400 text-sm hover:underline"
              >
                Voir toute la boutique
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(PACKS).map((pack) => (
                <div
                  key={pack.slug}
                  onClick={() => router.push('/boosters')}
                  className="group relative cursor-pointer"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${pack.color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500`}></div>
                  <div className="relative bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/10 transition-colors">
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
          <div className="bg-gradient-to-r from-blue-900/20 to-transparent border-l-4 border-blue-500 p-6 rounded-r-xl">
            <h3 className="font-bold mb-2">Conseil du jour</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Les cartes de rareté <span className="text-yellow-400">Legend</span> ont un taux d'apparition de 20% dans le Pack Légendaire.
              N'oubliez pas d'échanger vos doublons au marché pour optimiser votre progression.
            </p>
          </div>
        </div>
        <Footer />
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
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-6`}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-mono font-bold mb-2">{value}</p>
      <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
  );
}