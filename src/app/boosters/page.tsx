'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { PACKS } from '@/lib/boosters';
import { motion } from 'framer-motion';
import SafeImage from '@/components/SafeImage';

export default function BoostersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchProfile(data.user.id);
      } else {
        setLoading(false);
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
    setLoading(false);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-black items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="p-8 flex-1">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-2">
                Boutique Officielle
              </h1>
              <p className="text-gray-500 font-mono text-sm">Débloquez de nouvelles mécaniques et agrandissez votre garage.</p>
            </div>

            {profile && (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <span className="text-blue-500 text-xl font-bold">▲</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Votre Solde</div>
                  <div className="text-xl font-black italic tracking-tighter">{profile.ap} <span className="text-xs not-italic text-blue-500">AP</span></div>
                </div>
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
            {Object.values(PACKS).map((pack, i) => (
              <motion.div
                key={pack.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${pack.color} rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-500`}></div>

                <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 h-full flex flex-col overflow-hidden">
                  {/* Decorative Gradient Top */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${pack.color}`}></div>

                  <div className="flex-1">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-6 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                      <SafeImage
                        src={pack.imageUrl}
                        alt={pack.name}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent`}></div>
                    </div>

                    <h2 className="text-2xl font-bold mb-2">{pack.name}</h2>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                      {pack.description}
                      <br />
                      <span className="text-white/60 text-xs italic mt-2 block">
                        Contient {pack.cardCount} cartes aléatoires
                      </span>
                    </p>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <span className="text-2xl font-black italic tracking-tighter">
                        <span className="text-blue-500 not-italic mr-1 text-base">▲</span>{pack.price}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-600">Apex Points</span>
                    </div>

                    <button
                      disabled={profile && profile.ap < pack.price}
                      onClick={() => router.push(`/open?pack=${pack.slug}`)}
                      className={`w-full py-4 rounded-xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-lg shadow-black/40 
                        ${profile && profile.ap < pack.price
                          ? 'bg-gray-800 text-gray-600 grayscale cursor-not-allowed border border-white/5'
                          : `bg-gradient-to-r ${pack.color} text-white hover:scale-[1.02] active:scale-[0.98] hover:shadow-${pack.color.split('-')[1]}-500/20`
                        }`}
                    >
                      {profile && profile.ap < pack.price ? 'Solde Insuffisant' : 'Acheter le pack'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}