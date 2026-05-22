'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import {
  UserIcon,
  WalletIcon,
  LayersIcon,
  TrophyIcon,
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalCards: 0, uniqueCards: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 1. Fetch Profile (Credits, Username)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // 2. Fetch Card Stats
      const { data: cardData } = await supabase
        .from('user_cards')
        .select('count')
        .eq('user_id', user.id);

      if (cardData) {
        setStats({
          totalCards: cardData.reduce((acc, curr) => acc + curr.count, 0),
          uniqueCards: cardData.length
        });
      }

      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return (
    <div className="flex min-h-screen bg-black items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="p-4 md:p-12 flex-1">
          {/* Header Profile Section */}
          <div className="relative mb-12">
            <div className="h-48 w-full bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl overflow-hidden opacity-30 shadow-2xl border border-white/5">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>

            <div className="absolute -bottom-10 left-10 flex items-end gap-6">
              <div className="w-32 h-32 rounded-3xl bg-[#0a0a0a] border-4 border-[#050505] shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black italic">
                  {user.email?.[0].toUpperCase()}
                </div>
              </div>
              <div className="mb-4">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                  {profile?.username || user.email?.split('@')[0]}
                </h1>
                <p className="text-blue-500 font-mono text-xs tracking-widest uppercase">PILOTE OFFICIEL APEX</p>
              </div>
            </div>

            <div className="absolute bottom-4 right-8 flex gap-4">
              <button
                onClick={() => router.push('/settings')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3 transition-all text-xs font-black uppercase tracking-widest"
              >
                <SettingsIcon size={16} />
                Editer Profil
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            {/* Left Column: Stats & Balance */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 opacity-5 blur-[40px] rounded-full group-hover:opacity-10 transition-opacity" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <WalletIcon size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Balance Actuelle</h3>
                    <p className="text-2xl font-black italic tracking-tighter">▲ {profile?.ap || 0} <span className="text-[10px] not-italic text-gray-400 uppercase">AP</span></p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                  Recharger mon compte
                </button>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 space-y-4 shadow-2xl">
                <StatItem label="Cartes Collection" value={stats.totalCards} icon={<LayersIcon size={16} />} color="text-blue-400" />
                <StatItem label="Modèles Uniques" value={stats.uniqueCards} icon={<TrophyIcon size={16} />} color="text-purple-400" />
                <StatItem label="Niveau Pilote" value={Math.floor(stats.uniqueCards / 5) + 1} icon={<CreditCardIcon size={16} />} color="text-green-400" />
              </div>

              <button
                onClick={handleSignOut}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
              >
                <LogOutIcon size={16} />
                Se déconnecter
              </button>
            </div>

            {/* Right Column: Recent Activity & Badges */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-black uppercase italic tracking-tighter mb-4 inline-flex items-center gap-4">
                  Activité Récente
                  <div className="h-1 w-12 bg-blue-500 rounded-full" />
                </h2>
                <div className="space-y-4">
                  <ActivityRow
                    label="Ouverture de Booster"
                    desc="Pack Standard ouvert dans la boutique"
                    time="il y a 2 heures"
                    icon="🎁"
                  />
                  <ActivityRow
                    label="Nouvelle Carte"
                    desc="Ferrari 488 GTB ajoutée au garage"
                    time="il y a 5 heures"
                    icon="🏎️"
                  />
                  <ActivityRow
                    label="Bonus Journalier"
                    desc="+150 AP collectés"
                    time="Hier"
                    icon="▲"
                  />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-black uppercase italic tracking-tighter mb-4 inline-flex items-center gap-4">
                  Badges Débloqués
                  <div className="h-1 w-12 bg-purple-500 rounded-full" />
                </h2>
                <div className="flex flex-wrap gap-4">
                  <Badge icon="🏁" label="Premier Circuit" color="bg-blue-500/10 border-blue-500/30" />
                  <Badge icon="🔥" label="Collectionneur" color="bg-purple-500/10 border-purple-500/30" />
                  <Badge icon="⚡" label="Accro au Boost" color="bg-yellow-500/10 border-yellow-500/30" />
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center text-gray-700 text-xs text-center font-black uppercase tracking-tighter">
                    +12 <br /> Locked
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

function StatItem({ label, value, icon, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-black text-xs ${color}`}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
      </div>
      <span className="font-mono font-bold text-sm tracking-tighter">{value}</span>
    </div>
  );
}

function ActivityRow({ label, desc, time, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all border-l-4 border-l-blue-500">
      <div className="flex items-center gap-4">
        <div className="text-2xl">{icon}</div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest">{label}</h4>
          <p className="text-[10px] text-gray-500 font-medium">{desc}</p>
        </div>
      </div>
      <div className="text-[9px] font-mono text-gray-600 uppercase italic">{time}</div>
    </div>
  );
}

function Badge({ icon, label, color }: any) {
  return (
    <div className={`w-32 p-4 rounded-3xl border ${color} flex flex-col items-center gap-2 group cursor-help hover:scale-105 transition-all`}>
      <span className="text-3xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{label}</span>
    </div>
  );
}