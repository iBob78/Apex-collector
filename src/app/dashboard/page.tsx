'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllPages } from '@/lib/fetchAllPages';
import { getGarageProgress } from '@/lib/garage-level';
import Sidebar from '@/components/Sidebar';
import { ArrowRight, ArrowUpRight, Gauge, Layers3, Lightbulb, ShoppingBag, Trophy, Wallet } from 'lucide-react';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function DashboardPage() {
  const router = useRouter();
  const { language, t } = useSitePreferences();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalCards: 0, uniqueCards: 0 });
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('ap')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  }, []);

  const fetchStats = useCallback(async (userId: string) => {
    try {
      const data = await fetchAllPages((from, to) => supabase
        .from('user_cards')
        .select('id, count')
        .eq('user_id', userId)
        .order('id')
        .range(from, to));
      const total = data.reduce((acc, curr) => acc + curr.count, 0);
      setStats({
        totalCards: total,
        uniqueCards: data.length,
      });
      setStatsError(null);
    } catch (error) {
      console.error('[DashboardPage] Impossible de charger les possessions de véhicules:', error);
      setStatsError(t('Impossible de charger les statistiques de votre écurie.'));
    }
  }, [t]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchStats(data.user.id);
        fetchProfile(data.user.id);
      }
    });
  }, [fetchProfile, fetchStats]);

  const garageProgress = getGarageProgress(stats.uniqueCards);
  const progressCount = garageProgress.progress;
  const progressPercent = progressCount * 10;
  const apBalance = Number(profile?.ap) || 0;
  const duplicateCards = Math.max(0, stats.totalCards - stats.uniqueCards);
  const averageCopies = stats.uniqueCards > 0 ? stats.totalCards / stats.uniqueCards : 0;
  const formatNumber = (value: number) => new Intl.NumberFormat(language).format(value);
  const formatAverage = (value: number) => new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value);

  return (
    <div className="apex-paddock flex min-h-screen text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        {/* Persistent, compact balance / profile header across screen sizes. */}
        <header className="sticky top-0 z-40 flex min-h-[67px] items-center justify-between gap-3 border-b border-white/15 bg-[#0a0d0b]/95 px-4 py-2 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="min-w-0">
            <p className="race-eyebrow">01 / RACING DEPARTMENT</p>
            <h1 className="mt-1 truncate font-['Barlow_Condensed'] text-[20px] font-black uppercase tracking-[.05em] text-white sm:text-[25px]">{t('Tableau de bord')}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <div aria-label={t('Balance AP')} className="flex h-11 items-center gap-2 border-l-[3px] border-[#dbff35] bg-[#1b2419] px-3 sm:px-4">
              <Wallet size={16} className="hidden text-[#dbff35] sm:block" aria-hidden="true" />
              <div className="text-right">
                <p className="text-[8px] font-bold uppercase tracking-[.14em] text-[#9bac90]">{t('Balance AP')}</p>
                <p className="font-mono text-[12px] font-bold tabular-nums text-[#dbff35] sm:text-sm" title={formatNumber(apBalance) + ' AP'}>▲ {formatNumber(apBalance)} AP</p>
              </div>
            </div>
            {user && (
              <button
                type="button"
                onClick={() => router.push('/profile')}
                title={t('PROFIL PILOTE')}
                aria-label={t('PROFIL PILOTE')}
                className="flex h-11 w-11 items-center justify-center border border-white/25 bg-white/[.08] font-['Barlow_Condensed'] text-lg font-black uppercase text-white transition hover:border-[#dbff35]"
              >
                {user.email?.[0]?.toUpperCase() || 'A'}
              </button>
            )}
          </div>
        </header>

        <div className="paddock-shell flex flex-col gap-8 px-4 py-6 pb-28 sm:gap-11 sm:px-7 sm:py-8 lg:px-10 lg:pb-12">
          {statsError && (
            <p role="alert" className="border-l-4 border-red-500 bg-red-900/25 px-4 py-3 text-sm text-red-100">{statsError}</p>
          )}

          {/* The layout is a race poster, not three old dashboard tiles. */}
          <section className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(275px,.65fr)]" aria-label={t('Mon Garage')}>
            <div className="race-hero race-photo">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,9,.96)_0%,rgba(8,10,9,.76)_43%,rgba(8,10,9,.15)_100%)]" />
              <div className="absolute -right-5 top-0 select-none font-['Barlow_Condensed'] text-[12rem] font-black leading-none text-white/[.045] sm:text-[20rem]" aria-hidden="true">01</div>
              <div className="race-hero-content">
                <span className="race-poster-label mb-6">APEX // DRIVER TERMINAL</span>
                <p className="race-eyebrow mb-3">RACE SEASON / GARAGE 001</p>
                <h2 className="race-display max-w-[630px]">
                  {t('Mon Garage')}<span className="text-[#dbff35]">.</span>
                </h2>
                <p className="mt-6 max-w-md text-sm font-medium leading-relaxed text-white/80 sm:text-base">
                  {t('Gérez votre écurie et vos actifs.')}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/collection" className="paddock-action min-h-[49px] px-6">
                    {t('MA COLLECTION')} <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                  <Link href="/boosters" className="paddock-ghost inline-flex min-h-[49px] items-center gap-2 px-5 font-['Barlow_Condensed'] text-[13px] font-extrabold uppercase tracking-[.1em]">
                    {t('BOUTIQUE PACKS')} <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
                <div className="mt-9 flex items-center gap-4 border-t border-white/25 pt-4">
                  <span className="font-mono text-[10px] tracking-widest text-[#dbff35]">AC / 001</span>
                  <span className="h-px flex-1 bg-white/20" />
                  <span className="text-[10px] font-bold uppercase tracking-[.12em] text-gray-300">{t('Niveau écurie')} {garageProgress.level}</span>
                </div>
              </div>
            </div>

            <aside className="flex min-w-0 flex-col border border-white/20 bg-[#1a1f1b]">
              <div className="flex items-center justify-between border-b border-white/15 bg-[#dbff35] px-4 py-3 text-[#111610]">
                <span className="font-['Barlow_Condensed'] text-[13px] font-black uppercase tracking-[.18em]">GARAGE / STATUS</span>
                <Gauge size={19} aria-hidden="true" />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-7 p-5 sm:p-6">
                <div>
                  <p className="race-eyebrow">{t('Niveau écurie')}</p>
                  <p className="mt-3 font-['Barlow_Condensed'] text-[92px] font-black leading-[.72] tracking-[-.07em] text-[#dbff35] sm:text-[110px]">
                    {String(garageProgress.level).padStart(2, '0')}
                  </p>
                  <p className="mt-4 text-[12px] font-bold uppercase tracking-[.13em] text-gray-300">{t(garageProgress.tierTitle)}</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="race-progress-dial w-[114px] shrink-0" style={{ background: `conic-gradient(#dbff35 ${progressPercent}%,#353d35 0)` }} role="progressbar" aria-label={t('Vers le prochain niveau')} aria-valuemin={0} aria-valuemax={10} aria-valuenow={progressCount}>
                    <div>
                      <strong className="font-['Barlow_Condensed'] text-[37px] font-black leading-none text-white">{progressCount}<span className="text-[18px] text-[#dbff35]">/10</span></strong>
                      <span className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-gray-400">PROGRESS</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[.13em] text-white">{t('Vers le prochain niveau')}</p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400">{t('Modèles uniques')} / GARAGE XP</p>
                  </div>
                </div>
                <div className="race-stripes opacity-80" aria-hidden="true" />
              </div>
            </aside>
          </section>

          {/* A timing tower made exclusively of the player's real inventory counts. */}
          <section aria-label={t('Statistiques du garage')}>
            <div className="race-section-heading mb-4">
              <div className="min-w-0 flex-1">
                <p className="race-eyebrow">02 / GARAGE TELEMETRY</p>
                <h2 className="paddock-section-title mt-2">{t('Statistiques du garage')}</h2>
              </div>
              <span className="hidden font-mono text-[10px] font-bold tracking-widest text-[#dbff35] sm:block">DATA / AC-001</span>
            </div>
            <div className="grid grid-cols-2 gap-[2px] border border-white/20 bg-white/15 md:grid-cols-4">
              <Metric value={formatNumber(stats.uniqueCards)} label={t('Modèles uniques')} index="01" accent />
              <Metric value={formatNumber(stats.totalCards)} label={t('Cartes totales')} index="02" />
              <Metric value={formatNumber(duplicateCards)} label={t('Doublons')} index="03" />
              <Metric value={formatAverage(averageCopies)} label={t('Moyenne par modèle')} index="04" />
            </div>
          </section>

          <section aria-label={t('Accès rapide')}>
            <div className="race-section-heading mb-4">
              <div>
                <p className="race-eyebrow">03 / YOUR NEXT MOVE</p>
                <h2 className="paddock-section-title mt-2">{t('Accès rapide')}</h2>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <AccessPanel href="/collection" index="01" title={t('MA COLLECTION')} eyebrow="THE GARAGE" icon={<Layers3 size={24} aria-hidden="true" />} />
              <AccessPanel href="/missions" index="02" title={t('CONTRATS')} eyebrow="RACE OBJECTIVES" icon={<Trophy size={24} aria-hidden="true" />} />
              <AccessPanel href="/marketplace" index="03" title={t('Marketplace')} eyebrow="THE TRADING PADDOCK" icon={<ShoppingBag size={24} aria-hidden="true" />} />
            </div>
          </section>

          <aside className="race-pit-tile flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-7">
            <div className="flex shrink-0 items-center gap-2 text-[#dbff35]">
              <Lightbulb size={19} aria-hidden="true" />
              <span className="font-['Barlow_Condensed'] text-[16px] font-black uppercase tracking-[.1em]">PIT RADIO</span>
            </div>
            <span className="hidden h-8 w-px bg-white/20 sm:block" aria-hidden="true"/>
            <p className="text-sm leading-relaxed text-gray-300">{t('N’oubliez pas d’échanger vos doublons au marché pour optimiser votre progression.')}</p>
            <Link href="/marketplace" className="inline-flex shrink-0 items-center gap-2 text-[11px] font-black uppercase tracking-[.12em] text-[#dbff35] hover:text-white sm:ml-auto">{t('Marketplace')} <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Metric({ value, label, index, accent = false }: { value: string; label: string; index: string; accent?: boolean }) {
  return (
    <article className={`group relative min-w-0 overflow-hidden bg-[#141a16] px-4 py-5 sm:px-6 sm:py-7 ${accent ? 'bg-[#242c1d]' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-gray-500">G / {index}</span>
        <span className="h-[2px] w-9 bg-[#dbff35] opacity-40 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-6 truncate font-['Barlow_Condensed'] text-[clamp(2.6rem,5vw,5.5rem)] font-black leading-none tracking-[-.05em] tabular-nums text-white">{value}</p>
      <h3 className="mt-3 max-w-[180px] font-['Barlow_Condensed'] text-[13px] font-extrabold uppercase tracking-[.12em] text-[#d3e0c9]">{label}</h3>
    </article>
  );
}

function AccessPanel({ href, index, title, eyebrow, icon }: { href: string; index: string; title: string; eyebrow: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="race-card-outline group flex min-h-[160px] flex-col justify-between gap-5 px-5 py-5 transition hover:-translate-y-1 sm:px-6 sm:py-6">
      <div className="flex items-start justify-between gap-4">
        <span className="font-['Barlow_Condensed'] text-[58px] font-black leading-[.85] tracking-[-.06em] text-white/20 group-hover:text-[#dbff35]">{index}</span>
        <span className="text-[#dbff35]">{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#b0b9aa]">{eyebrow}</p>
          <h3 className="mt-1 font-['Barlow_Condensed'] text-[27px] font-black uppercase leading-none tracking-tight text-white">{title}</h3>
        </div>
        <ArrowUpRight size={20} className="shrink-0 text-[#dbff35]" aria-hidden="true" />
      </div>
    </Link>
  );
}
