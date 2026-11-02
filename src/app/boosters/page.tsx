'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabaseClient';
import { PACKS } from '@/lib/boosters';
import { motion } from 'framer-motion';
import SafeImage from '@/components/SafeImage';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function BoostersPage() {
  const router = useRouter();
  const { t } = useSitePreferences();
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
      <main className="min-w-0 flex-1 flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-2">
                {t('Boutique Officielle')}
              </h1>
              <p className="text-gray-500 font-mono text-sm">{t('Débloquez de nouvelles mécaniques et agrandissez votre garage.')}</p>
            </div>

            {profile && (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <span className="text-blue-500 text-xl font-bold">▲</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">{t('Votre Solde')}</div>
                  <div className="text-xl font-black italic tracking-tighter">{profile.ap} <span className="text-xs not-italic text-blue-500">AP</span></div>
                </div>
              </div>
            )}
          </header>

          <div className="grid grid-cols-2 gap-x-2 gap-y-3 py-3 sm:grid-cols-2 sm:gap-6 sm:py-4 xl:grid-cols-3">
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

                <div className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] p-2.5 sm:rounded-2xl sm:p-6">
                  {/* Decorative Gradient Top */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${pack.color}`}></div>

                  <div className="flex-1">
                    <div className="relative mx-auto mb-2.5 aspect-[3/4] w-[62%] overflow-hidden rounded-lg shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] sm:mb-6 sm:w-[50%] sm:rounded-xl">
                      <SafeImage
                        src={pack.imageUrl}
                        alt={pack.name}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent`}></div>
                    </div>

                    <h2 className="mb-1 min-h-8 text-[13px] font-bold leading-4 sm:mb-2 sm:min-h-0 sm:text-2xl sm:leading-normal">{t(pack.name)}</h2>
                    <p className="mb-2 text-[10px] leading-[1.35] text-gray-400 sm:mb-6 sm:text-sm sm:leading-relaxed">
                      <span className="line-clamp-2 sm:line-clamp-none">{t(pack.description)}</span>
                      <span className="mt-1 block text-[9px] italic text-white/60 sm:mt-2 sm:text-xs">
                        {t('Contient')} {pack.cardCount} {t('cartes aléatoires')}
                      </span>
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-8">
                    <div className="mb-2 flex min-w-0 items-center justify-between gap-1 sm:mb-4 sm:px-2">
                      <span className="whitespace-nowrap text-base font-black italic tracking-tighter sm:text-2xl">
                        <span className="mr-0.5 text-xs not-italic text-blue-500 sm:mr-1 sm:text-base">▲</span>{pack.price}<span className="ml-1 text-[9px] not-italic text-blue-400 sm:hidden">AP</span>
                      </span>
                      <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 sm:inline">{t('Apex Points')}</span>
                    </div>

                    <button
                      disabled={profile && profile.ap < pack.price}
                      onClick={() => router.push(`/open?pack=${pack.slug}`)}
                      className={`min-h-10 w-full rounded-lg px-1 py-2 text-[9px] font-black uppercase leading-tight tracking-normal shadow-lg shadow-black/40 transition-all duration-300 sm:rounded-xl sm:py-4 sm:text-xs sm:tracking-[0.2em] 
                        ${profile && profile.ap < pack.price
                          ? 'bg-gray-800 text-gray-600 grayscale cursor-not-allowed border border-white/5'
                          : `bg-gradient-to-r ${pack.color} text-white hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-black/50`
                        }`}
                    >
                      {profile && profile.ap < pack.price ? t('Solde Insuffisant') : t('Acheter le pack')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}