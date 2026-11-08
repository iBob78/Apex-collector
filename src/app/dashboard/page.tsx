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
        <div className="paddock-shell flex flex-col gap-7 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {/* Keep AP in a compact, persistent top-right header instead of the statistics grid. */}
          <header className="sticky top-0 z-40 -mx-4 -mt-6 flex items-start justify-between gap-2 border-b border-cyan-100/10 bg-[#0a1421]/95 px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,.12)] backdrop-blur-xl sm:-mx-6 sm:-mt-8 sm:items-center sm:px-6 sm:py-4 lg:-mx-10 lg:-mt-10 lg:px-10">
            <div className="min-w-0">
              <h1
                className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-[27px] font-normal uppercase not-italic leading-none tracking-[0.035em] text-transparent sm:text-4xl"
                style={{ fontFamily: '"Bebas Neue", Impact, "Arial Narrow", sans-serif' }}
              >
                {t('Tableau de bord')}
              </h1>
              <p className="mt-1 hidden text-xs text-gray-400 sm:block sm:text-sm">
                {t('Gérez votre écurie et vos actifs.')}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div
                aria-label={t('Balance AP')}
                className="flex min-h-9 flex-col justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/[0.08] px-2 py-1 text-right shadow-[0_1px_16px_rgba(0,0,0,0.18)]"
              >
                <span className="text-[8px] font-bold uppercase leading-tight tracking-normal text-emerald-200/70">
                  {t('Balance AP')}
                </span>
                <span className="max-w-[35vw] truncate font-mono text-xs font-black leading-tight tabular-nums text-emerald-200 sm:max-w-[12rem] sm:text-sm" title={formatNumber(apBalance) + ' AP'}>
                  ▲ {formatNumber(apBalance)} AP
                </span>
              </div>
              {user && (
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  aria-label={t('PROFIL PILOTE')}
                  title={t('PROFIL PILOTE')}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#11151c] text-sm font-bold text-white transition hover:border-blue-400/40 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {user.email?.[0]?.toUpperCase() || 'A'}
                </button>
              )}
            </div>
          </header>

          {/* Motorsport-style command deck, populated exclusively with actual garage stats. */}
          <section className="paddock-hero grid min-w-0 gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] lg:items-center" aria-label={t('Niveau écurie')}>
            <div className="relative z-10 min-w-0">
              <p className="paddock-eyebrow">APEX / GARAGE CONTROL</p>
              <h2 className="mt-4 max-w-[550px] text-[clamp(2.7rem,6vw,5.7rem)] font-normal uppercase leading-[.89] tracking-[.03em] text-white" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>
                {t('Mon Garage')}<span className="text-[#e7c18a]">.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">{t('Gérez votre écurie et vos actifs.')}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/collection" className="paddock-action min-h-11 px-5">
                  {t('MA COLLECTION')} <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_11px_rgba(110,231,183,.6)]" />
                  {t('Niveau écurie')} {garageProgress.level}
                </span>
              </div>
            </div>
            <div className="paddock-panel relative z-10 min-w-0 overflow-hidden p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="paddock-micro">{t('Vers le prochain niveau')}</p>
                <Gauge size={18} className="text-[#e7c18a]" aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <span className="paddock-stat-number text-[#e7c18a]">{garageProgress.level}</span>
                <span className="mb-1 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">{t(garageProgress.tierTitle)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-300">
                <span>{t('Vers le prochain niveau')}</span>
                <strong className="font-mono text-cyan-200">{progressCount}/10</strong>
              </div>
              <div className="paddock-meter mt-2"><div style={{ width: progressPercent + '%' }} /></div>
              <div className="paddock-telemetry mt-5 h-7 opacity-70" aria-hidden="true" />
            </div>
          </section>

          {/* Smaller cards, more practical numbers, and no duplicate AP balance. */}
          <section aria-label={t('Statistiques du garage')}>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-[3px] rounded-full bg-[#e7c18a]" aria-hidden="true" />
              <h2 className="paddock-section-title">
                {t('Statistiques du garage')}
              </h2>
            </div>

            {statsError && (
              <p role="alert" className="mb-4 rounded-lg border border-red-400/20 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                {statsError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              <article className="paddock-data-card flex min-w-0 flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-200 sm:text-xs">
                    {t('Mon Garage')}
                  </h3>
                  <Layers3 size={20} className="shrink-0 text-blue-300" aria-hidden="true" />
                </div>
                <p className="mt-3 font-mono text-3xl font-black tabular-nums text-white sm:text-4xl">
                  {formatNumber(stats.uniqueCards)}
                </p>
                <p className="mt-1 text-xs text-gray-400">{t('Modèles uniques')}</p>
                <div className="mt-auto space-y-2 border-t border-white/10 pt-3 text-xs sm:mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-gray-400">
                    <span>{t('Niveau écurie')}</span>
                    <strong className="font-mono text-blue-200">{garageProgress.level}</strong>
                  </div>
                  <Link
                    href="/collection"
                    className="inline-flex min-h-8 items-center gap-1 font-bold text-blue-300 transition hover:text-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    {t('MA COLLECTION')}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>

              <article className="paddock-data-card flex min-w-0 flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-violet-200 sm:text-xs">
                    {t('Cartes totales')}
                  </h3>
                  <Layers3 size={20} className="shrink-0 text-violet-300" aria-hidden="true" />
                </div>
                <p className="mt-3 font-mono text-3xl font-black tabular-nums text-white sm:text-4xl">
                  {formatNumber(stats.totalCards)}
                </p>
                <p className="mt-1 text-xs text-gray-400">{t('Exemplaires')}</p>
                <div className="mt-auto space-y-2 border-t border-white/10 pt-3 text-xs sm:mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-gray-400">{t('Doublons')}</span>
                    <strong className="font-mono text-gray-100">{formatNumber(duplicateCards)}</strong>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-gray-400">{t('Moyenne par modèle')}</span>
                    <strong className="font-mono text-gray-100">{formatAverage(averageCopies)}</strong>
                  </div>
                </div>
              </article>

              <article className="paddock-data-card col-span-2 min-w-0 self-start p-3 sm:p-4 lg:col-span-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Gauge size={17} className="shrink-0 text-amber-300" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-200 sm:text-xs">
                        {t('Niveau écurie')}
                      </h3>
                      <p className="truncate text-[10px] text-gray-400 sm:text-xs">{t(garageProgress.tierTitle)}</p>
                    </div>
                  </div>
                  <strong className="font-mono text-xl font-black tabular-nums text-white sm:text-2xl">
                    {garageProgress.level}
                  </strong>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-gray-400">
                  <span>{t('Vers le prochain niveau')}</span>
                  <span className="shrink-0 font-mono tabular-nums text-amber-200">{progressCount}/10</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={t('Vers le prochain niveau')}
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-valuenow={progressCount}
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"
                >
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-200" style={{ width: progressPercent + '%' }} />
                </div>
              </article>
            </div>
          </section>

          {/* Direct links instead of a promotional booster listing. */}
          <section aria-label={t('Accès rapide')}>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-[3px] rounded-full bg-[#e7c18a]" aria-hidden="true" />
              <h2 className="paddock-section-title">
                {t('Accès rapide')}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DashboardShortcut href="/collection" label={t('MA COLLECTION')} icon={<Layers3 size={22} aria-hidden="true" />} />
              <DashboardShortcut href="/missions" label={t('CONTRATS')} icon={<Trophy size={22} aria-hidden="true" />} />
              <DashboardShortcut href="/marketplace" label={t('Marketplace')} icon={<ShoppingBag size={22} aria-hidden="true" />} />
            </div>
          </section>

          <aside className="paddock-panel flex items-start gap-3 p-4 sm:p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
              <Lightbulb size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-100">{t('Conseil du jour')}</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-400">
                {t('N’oubliez pas d’échanger vos doublons au marché pour optimiser votre progression.')}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function DashboardShortcut({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="paddock-data-card group flex min-h-[90px] items-center gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-300">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-xs font-black uppercase tracking-wide text-gray-100 sm:text-sm">
        {label}
      </span>
      <ArrowUpRight size={17} className="shrink-0 text-gray-500 transition group-hover:text-blue-300" aria-hidden="true" />
    </Link>
  );
}
