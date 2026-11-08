'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabaseClient';
import { PACKS } from '@/lib/boosters';
import { motion } from 'framer-motion';
import SafeImage from '@/components/SafeImage';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import { fetchAllPages } from '@/lib/fetchAllPages';

type DailyBooster = {
  id: string;
  pack_slug: string;
  streak_day: number;
  created_at: string;
};

export default function BoostersPage() {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dailyBoosters, setDailyBoosters] = useState<DailyBooster[]>([]);
  const [dailyBoosterError, setDailyBoosterError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const [profileResult, dailyBoostersResult] = await Promise.all([
        supabase.from('profiles').select('ap').eq('id', userId).single(),
        fetchAllPages((from, to) => supabase.from('user_daily_boosters')
          .select('id, pack_slug, streak_day, created_at')
          .eq('user_id', userId)
          .is('opened_at', null)
          .order('created_at', { ascending: true })
          .order('id', { ascending: true })
          .range(from, to)),
      ]);
      if (profileResult.data) setProfile(profileResult.data);
      setDailyBoosterError(null);
      setDailyBoosters((dailyBoostersResult ?? []) as DailyBooster[]);
    } catch (error) {
      console.error('[BoostersPage] Impossible de charger les boosters quotidiens:', error);
      setDailyBoosterError(t('Impossible de charger vos boosters offerts.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        void fetchProfile(data.user.id);
      } else {
        setLoading(false);
      }
    });
  }, [fetchProfile]);

  if (loading) return (
    <div className="flex min-h-screen bg-black items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="apex-paddock flex min-h-screen text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="paddock-shell px-4 py-6 pb-28 sm:px-7 sm:py-8 lg:px-10 lg:pb-12">
          <header className="relative mb-8 overflow-hidden border border-white/20 bg-[#101510]">
            <div className="race-photo-soft absolute inset-0 opacity-65" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e0b] via-[#10150e]/90 to-[#10150e]/50" />
            <div className="relative grid gap-6 px-5 py-8 sm:px-9 sm:py-10 lg:grid-cols-[minmax(0,1fr)_245px] lg:items-end">
              <div className="min-w-0">
                <p className="race-eyebrow">02 / THE PIT SUPPLY</p>
                <h1 className="paddock-title mt-5 max-w-[690px]">{t('Boutique Officielle')}<span className="text-[#dbff35]">.</span></h1>
                <p className="mt-5 max-w-lg border-l-[3px] border-[#f4523d] pl-4 text-sm leading-relaxed text-gray-300">
                  {t('Débloquez de nouvelles mécaniques et agrandissez votre garage.')}
                </p>
                <div className="mt-6 flex items-center gap-3 font-['Barlow_Condensed'] text-[13px] font-black uppercase tracking-[.15em] text-[#dbff35]">
                  <span className="h-2 w-2 bg-[#f4523d]"/>
                  {Object.keys(PACKS).length} {t('Boosters')} <span className="text-gray-500">/ PACK CATALOGUE</span>
                </div>
              </div>
              <div className="relative flex flex-col justify-between border-l-4 border-[#dbff35] bg-[#181f17] px-5 py-4 shadow-[0_15px_42px_rgba(0,0,0,.3)]">
                <span className="font-['Barlow_Condensed'] text-[13px] font-black uppercase tracking-[.13em] text-gray-400">{t('Votre Solde')}</span>
                <span className="mt-2 font-['Barlow_Condensed'] text-[51px] font-black leading-none tabular-nums text-[#dbff35]">
                  {profile ? new Intl.NumberFormat('fr-FR').format(Number(profile.ap) || 0) : '—'} <span className="text-[18px]">AP</span>
                </span>
                <span className="mt-2 font-mono text-[10px] uppercase tracking-[.08em] text-gray-400">APEX POINTS / BALANCE</span>
              </div>
            </div>
            <div className="race-stripes" aria-hidden="true" />
          </header>

          {dailyBoosterError && <p role="alert" className="mb-6 border-l-4 border-[#f4523d] bg-red-900/20 p-4 text-sm text-red-200">{dailyBoosterError}</p>}

          {dailyBoosters.length > 0 && (
            <section aria-labelledby="daily-boosters-heading" className="mb-10 border border-[#dbff35]/35 bg-[#1d2519]">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#dbff35] px-4 py-3 text-[#10140e] sm:px-6">
                <h2 id="daily-boosters-heading" className="font-['Barlow_Condensed'] text-[24px] font-black uppercase leading-none">{t('Boosters offerts à ouvrir')}</h2>
                <span className="font-mono text-[11px] font-bold uppercase">{dailyBoosters.length} {t(dailyBoosters.length === 1 ? 'booster disponible' : 'boosters disponibles')}</span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                {dailyBoosters.map((dailyBooster) => {
                  const pack = PACKS[dailyBooster.pack_slug];
                  if (!pack) {
                    console.error('[BoostersPage] Type de booster quotidien inconnu:', dailyBooster.pack_slug);
                    return null;
                  }
                  return (
                    <article key={dailyBooster.id} className="flex min-w-0 items-center gap-3 border border-white/20 bg-[#121711] p-3">
                      <div className="relative h-[94px] w-[67px] shrink-0 overflow-hidden bg-[#090c09]">
                        <SafeImage src={pack.imageUrl} alt={pack.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#dbff35]">{t('Récompenses de connexion')} / {dailyBooster.streak_day} / 7</p>
                        <h3 className="mt-1 truncate font-['Barlow_Condensed'] text-[23px] font-black uppercase leading-none">{t(pack.name)}</h3>
                        <button type="button" onClick={() => router.push(`/open?daily_booster=${encodeURIComponent(dailyBooster.id)}`)}
                          className="paddock-action mt-3 min-h-10 px-3 py-2">{t('Ouvrir ce booster offert')}</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <div className="race-section-heading mb-5">
            <div className="flex-1">
              <p className="race-eyebrow">PIT SUPPLY / PICK YOUR PACK</p>
              <h2 className="paddock-section-title mt-2">{t('Boosters')}</h2>
            </div>
            <span className="hidden font-['Barlow_Condensed'] text-[13px] font-extrabold uppercase tracking-[.16em] text-[#dbff35] sm:block">COLLECT / UNSEAL / DISCOVER</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-3">
            {Object.values(PACKS).map((pack, i) => (
              <motion.article key={pack.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .33, delay: i * .06 }} className="paddock-pack-card group flex min-w-0 flex-col">
                <div className={`absolute left-0 right-0 top-0 z-10 h-[4px] bg-gradient-to-r ${pack.color}`} aria-hidden="true"/>
                <div className="relative overflow-hidden border-b border-white/15 bg-[#090d0b] px-3 pb-3 pt-4 sm:px-6 sm:pb-5 sm:pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-[#dbff35]">DROP // {String(i+1).padStart(2,'0')}</span>
                    <span className="font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.08em] text-gray-300">{pack.cardCount} {t('Cartes')}</span>
                  </div>
                  <span className="absolute -bottom-5 right-0 select-none font-['Barlow_Condensed'] text-[130px] font-black leading-none text-white/[.035] sm:text-[200px]" aria-hidden="true">{String(i + 1).padStart(2,'0')}</span>
                  <div className="relative mx-auto mt-3 aspect-[3/4] w-[65%] max-w-[185px] rotate-[-4deg] overflow-hidden shadow-[14px_18px_24px_rgba(0,0,0,.42)] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-[1.03] sm:mt-5 sm:w-[55%]">
                    <SafeImage src={pack.imageUrl} alt={pack.name} fill className="object-cover" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-6 sm:pb-6 sm:pt-5">
                  <h3 className="min-h-[38px] font-['Barlow_Condensed'] text-[25px] font-black uppercase leading-[.85] tracking-[-.02em] text-white sm:min-h-[48px] sm:text-[39px]">{t(pack.name)}</h3>
                  <p className="mt-2 line-clamp-2 text-[10px] leading-[1.45] text-gray-400 sm:mt-3 sm:text-sm">{t(pack.description)}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[.07em] text-gray-500 sm:text-xs">{t('Contient')} {pack.cardCount} {t('cartes aléatoires')}</p>
                  <div className="mt-auto pt-4">
                    <div className="mb-3 flex items-end justify-between gap-1 border-t border-white/20 pt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="font-['Barlow_Condensed'] text-[32px] font-black leading-none tabular-nums text-[#dbff35] sm:text-[44px]">{pack.price}</span>
                        <span className="font-mono text-[10px] font-bold text-[#dbff35]">AP</span>
                      </div>
                      <span className="hidden font-['Barlow_Condensed'] text-[11px] font-bold uppercase tracking-[.14em] text-gray-500 sm:block">APEX POINTS</span>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(profile && profile.ap < pack.price)}
                      onClick={() => router.push(`/open?pack=${pack.slug}`)}
                      className="paddock-action min-h-[42px] w-full px-1.5 py-3 text-center text-[11px] leading-tight sm:min-h-[48px] sm:text-[14px]">
                      {profile && profile.ap < pack.price ? t('Solde Insuffisant') : t('Acheter le pack')}
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
