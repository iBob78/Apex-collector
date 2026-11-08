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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#555D65]"></div>
    </div>
  );

  return (
    <div className="apex-paddock flex min-h-screen text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="paddock-shell px-4 py-6 pb-28 sm:px-7 sm:py-8 lg:px-10 lg:pb-12">
          <header className="race-photo-soft relative mb-7 overflow-hidden rounded-[22px] border border-[#7084bc]/25">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1227]/95 via-[#101b39]/80 to-[#0b1228]/40" aria-hidden="true"/>
            <div className="relative z-10 grid min-h-[255px] items-center gap-5 px-5 py-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:py-9">
              <div>
                <p className="paddock-eyebrow mb-3">APEX COLLECTOR / BOOSTERS</p>
                <h1 className="font-['Barlow_Condensed'] text-[clamp(2.9rem,6vw,5.6rem)] font-black italic leading-[.86] tracking-[-.035em] text-white">
                  {t('Boutique Officielle')}
                </h1>
                <p className="mt-4 max-w-[430px] text-[13px] leading-relaxed text-[#c2cfea] sm:text-[15px]">
                  {t('Débloquez de nouvelles mécaniques et agrandissez votre garage.')}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="rounded-full border border-[#7294ef]/35 bg-[#18294d]/70 px-3 py-1.5 text-[11px] font-bold text-[#bad1ff]">
                    {Object.keys(PACKS).length} {t('Boosters')}
                  </span>
                </div>
              </div>
              <div className="apx-hud flex items-center justify-between gap-4 px-5 py-4 lg:flex-col lg:items-start lg:gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#a8b7d6]">{t('Votre Solde')}</span>
                <span className="font-['Barlow_Condensed'] text-[clamp(2rem,4vw,3.8rem)] font-black leading-none tabular-nums text-white">
                  {profile ? new Intl.NumberFormat('fr-FR').format(Number(profile.ap) || 0) : '—'} <span className="text-[20px] text-[#f5c66d]">AP</span>
                </span>
              </div>
            </div>
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#ec3b5c] via-[#765cf1] to-[#60b8ff]"/>
          </header>
          {dailyBoosterError && <p role="alert" className="mb-6 border-l-4 border-[#D32F35] bg-red-900/20 p-4 text-sm text-red-200">{dailyBoosterError}</p>}

          {dailyBoosters.length > 0 && (
            <section aria-labelledby="daily-boosters-heading" className="paddock-panel mb-9 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d6a2ff]/20 bg-gradient-to-r from-[#36235b] to-[#182d58] px-4 py-3 text-white sm:px-6">
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
                    <article key={dailyBooster.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#0c1830]/80 p-3">
                      <div className="relative h-[94px] w-[67px] shrink-0 overflow-hidden rounded-lg bg-[#0d1528] shadow-[0_7px_17px_rgba(0,0,0,.4)]">
                        <SafeImage src={pack.imageUrl} alt={pack.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#adbbff]">{t('Récompenses de connexion')} / {dailyBooster.streak_day} / 7</p>
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
            <span className="hidden font-['Barlow_Condensed'] text-[13px] font-extrabold uppercase tracking-[.16em] text-[#F0EFEB] sm:block">COLLECT / UNSEAL / DISCOVER</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
            {Object.values(PACKS).map((pack, i) => (
              <motion.article key={pack.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .33, delay: i * .06 }} className="paddock-pack-card group flex min-w-0 flex-col">
                <div className={`absolute left-0 right-0 top-0 z-10 h-[4px] bg-gradient-to-r ${pack.color}`} aria-hidden="true"/>
                <div className="apx-pack-display relative overflow-hidden px-3 pb-3 pt-4 sm:px-6 sm:pb-5 sm:pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-[#a6baff]">DROP // {String(i+1).padStart(2,'0')}</span>
                    <span className="font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.08em] text-gray-300">{pack.cardCount} {t('Cartes')}</span>
                  </div>
                  <span className="absolute -bottom-5 right-0 select-none font-['Barlow_Condensed'] text-[130px] font-black leading-none text-white/[.035] sm:text-[200px]" aria-hidden="true">{String(i + 1).padStart(2,'0')}</span>
                  <div className="relative mx-auto mt-3 aspect-[3/4] w-[65%] max-w-[185px] -rotate-3 overflow-hidden rounded-lg shadow-[0_15px_32px_rgba(0,0,0,.48),0_0_25px_rgba(101,95,239,.18)] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-[1.06] sm:mt-5 sm:w-[55%]">
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
                        <span className="font-['Barlow_Condensed'] text-[32px] font-black leading-none tabular-nums text-[#f5c66d] sm:text-[44px]">{pack.price}</span>
                        <span className="font-mono text-[10px] font-bold text-[#f5c66d]">AP</span>
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
