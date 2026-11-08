'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllPages } from '@/lib/fetchAllPages';
import { getGarageProgress } from '@/lib/garage-level';
import Sidebar from '@/components/Sidebar';
import { ArrowUpRight, Gauge, Lightbulb, Wallet } from 'lucide-react';
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
        <header className="sticky top-0 z-40 flex min-h-[62px] items-center justify-between gap-3 border-b border-white/10 bg-[#0a1021]/95 px-4 py-2 backdrop-blur-xl sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#8d9fce]">APEX / GARAGE</p>
            <h1 className="truncate text-[14px] font-bold text-white sm:text-[16px]">{t('Tableau de bord')}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div aria-label={t('Balance AP')} className="apx-hud flex min-h-[43px] items-center gap-2 px-3 sm:px-4">
              <Wallet size={17} className="text-[#ffcf68]" aria-hidden="true" />
              <div className="text-right">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#a3b2d1]">{t('Balance AP')}</p>
                <p className="font-mono text-[13px] font-bold tabular-nums text-white">{formatNumber(apBalance)} AP</p>
              </div>
            </div>
            {user && (
              <button type="button" onClick={() => router.push('/profile')} title={t('PROFIL PILOTE')}
                aria-label={t('PROFIL PILOTE')}
                className="apx-hud flex h-[43px] w-[43px] items-center justify-center rounded-full text-[16px] font-black text-[#bacaff] transition hover:border-[#9caaff]">
                {user.email?.[0]?.toUpperCase() || 'A'}
              </button>
            )}
          </div>
        </header>

        <div className="paddock-shell space-y-6 px-3 py-4 pb-28 sm:px-6 sm:py-6 lg:px-8 lg:pb-12">
          {statsError && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{statsError}</div>}
          <section className="apx-dashboard-hero flex min-h-[380px] flex-col justify-center px-5 py-9 sm:min-h-[415px] sm:px-10 lg:px-12" aria-label="Apex Collector">
            <div className="relative z-10 max-w-[650px]">
              <p className="paddock-eyebrow mb-5">THE ULTIMATE CAR COLLECTION</p>
              <div className="font-['Barlow_Condensed'] text-[clamp(3.5rem,9vw,7rem)] font-black italic uppercase leading-[.72] tracking-[-.055em] text-white drop-shadow-2xl">
                APEX <span className="block mt-3 text-[.72em] tracking-[-.035em] text-[#f7f8ff]">COLLECTOR<span className="text-[#ed344f]">.</span></span>
              </div>
              <p className="mt-7 max-w-md text-[14px] leading-relaxed text-[#e0e6f2] sm:text-[16px]">
                {t('Collectionnez les plus belles voitures et faites grandir votre écurie.')}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/boosters" className="paddock-action min-h-12 px-6">{t('Ouvrir un Booster')} <ArrowUpRight size={17} aria-hidden="true"/></Link>
                <Link href="/collection" className="paddock-ghost inline-flex min-h-12 items-center gap-2 px-5 text-[13px] font-bold">
                  {t('MA COLLECTION')} <ArrowUpRight size={16} aria-hidden="true"/>
                </Link>
              </div>
            </div>
            <span aria-hidden="true" className="absolute bottom-4 right-5 font-mono text-[10px] tracking-[.15em] text-white/55">APEX COLLECTOR / GARAGE</span>
          </section>

          <section aria-label={t('Accès rapide')}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="paddock-section-title text-[28px] sm:text-[35px]">{t('Accès rapide')}</h2>
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-[#8397bd] sm:block">DÉCOUVRIR · COLLECTIONNER · ÉVOLUER</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/boosters" className="apx-shortcut group">
                <img src="/showcase-boosters.png" alt="" className="apx-shortcut-image shrink-0" />
                <div className="relative z-10 min-w-0">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[.13em] text-[#f38ba6]">BOOSTER / 01</p>
                  <h3 className="text-[19px] font-black leading-[1.08] text-white sm:text-[22px]">{t('Ouvrir un Booster')}</h3>
                  <ArrowUpRight size={18} className="mt-3 text-[#ff6485]" aria-hidden="true"/>
                </div>
              </Link>
              <Link href="/collection" className="apx-shortcut group">
                <img src="/showcase-card.png" alt="" className="apx-shortcut-image shrink-0" />
                <div className="relative z-10 min-w-0">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[.13em] text-[#94bdfd]">GARAGE / 02</p>
                  <h3 className="text-[19px] font-black leading-[1.08] text-white sm:text-[22px]">{t('MA COLLECTION')}</h3>
                  <ArrowUpRight size={18} className="mt-3 text-[#69aeff]" aria-hidden="true"/>
                </div>
              </Link>
              <Link href="/missions" className="apx-shortcut group">
                <img src="/showcase-missions.png" alt="" className="apx-shortcut-image shrink-0" />
                <div className="relative z-10 min-w-0">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[.13em] text-[#c2a0ff]">MISSIONS / 03</p>
                  <h3 className="text-[19px] font-black leading-[1.08] text-white sm:text-[22px]">{t('CONTRATS')}</h3>
                  <ArrowUpRight size={18} className="mt-3 text-[#ac8bff]" aria-hidden="true"/>
                </div>
              </Link>
            </div>
          </section>

          <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_270px]" aria-label={t('Statistiques du garage')}>
            <div className="paddock-panel p-4 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <h2 className="paddock-section-title">{t('Statistiques du garage')}</h2>
                <span className="paddock-micro">COLLECTOR / STATS</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <GarageMetric value={formatNumber(stats.uniqueCards)} label={t('Modèles uniques')} />
                <GarageMetric value={formatNumber(stats.totalCards)} label={t('Cartes totales')} />
                <GarageMetric value={formatNumber(duplicateCards)} label={t('Doublons')} />
                <GarageMetric value={formatAverage(averageCopies)} label={t('Moyenne par modèle')} />
              </div>
            </div>
            <div className="paddock-panel flex flex-col justify-between p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="paddock-micro">{t('Niveau écurie')}</span>
                <Gauge size={19} className="text-[#8caafa]" aria-hidden="true"/>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="paddock-stat-number text-[#f7f9ff]">{garageProgress.level}</span>
                <span className="mb-2 text-[11px] font-semibold text-[#c0cae3]">{t(garageProgress.tierTitle)}</span>
              </div>
              <p className="mt-3 text-[11px] text-[#b3bfd8]">{t('Vers le prochain niveau')} <strong className="float-right font-mono text-[#86bbff]">{progressCount}/10</strong></p>
              <div className="paddock-meter mt-2"><div style={{width:`${progressPercent}%`}} /></div>
            </div>
          </section>
          <aside className="paddock-panel flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
            <Lightbulb size={20} className="shrink-0 text-[#9ea6ff]" aria-hidden="true"/>
            <p className="min-w-0 flex-1 text-[13px] text-[#b3bdd5]">{t('N’oubliez pas d’échanger vos doublons au marché pour optimiser votre progression.')}</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-[12px] font-bold text-[#99bfff] hover:text-white">{t('Marketplace')} <ArrowUpRight size={16}/></Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

function GarageMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="apx-dashboard-metric min-w-0">
      <p className="truncate font-['Barlow_Condensed'] text-[clamp(2.3rem,4vw,3.8rem)] font-black leading-none tabular-nums text-white">{value}</p>
      <p className="mt-2 text-[11px] font-semibold text-[#a8b9df]">{label}</p>
    </div>
  );
}
