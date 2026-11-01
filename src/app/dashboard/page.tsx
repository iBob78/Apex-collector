'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import { ArrowRight, ArrowUpRight, Gauge, Layers3, Lightbulb, ShoppingBag, Trophy, Wallet } from 'lucide-react';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function DashboardPage() {
  const router = useRouter();
  const { language, t } = useSitePreferences();
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
        uniqueCards: data.length,
      });
    }
  };

  // Keep the existing level formula and underlying data unchanged.
  const garageLevel = Math.floor(stats.uniqueCards / 10) + 1;
  const progressCount = stats.uniqueCards % 10;
  const progressPercent = progressCount * 10;
  const apBalance = Number(profile?.ap) || 0;
  const formatNumber = (value: number) => new Intl.NumberFormat(language).format(value);

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-7 px-4 py-6 sm:gap-9 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {/* Main dashboard header and existing profile shortcut. */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-3xl font-normal uppercase not-italic tracking-[0.035em] text-transparent sm:text-4xl"
                style={{ fontFamily: '"Bebas Neue", Impact, "Arial Narrow", sans-serif' }}
              >
                {t('Tableau de bord')}
              </h1>
              <p className="mt-2 text-sm text-gray-400 sm:text-base">
                {t('Gérez votre écurie et vos actifs.')}
              </p>
            </div>
            {user && (
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="group flex min-h-12 items-center gap-3 self-start rounded-xl border border-white/10 bg-[#11151c] px-3 py-2.5 text-left transition hover:border-blue-400/40 hover:bg-white/[0.07] sm:self-auto"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">
                  {user.email?.[0]?.toUpperCase() || 'A'}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="max-w-[12rem] truncate text-xs font-semibold tracking-wide text-gray-200">
                    {user.email?.split('@')[0] || t('PROFIL PILOTE')}
                  </span>
                  <span className="text-xs font-bold text-blue-300">▲ {formatNumber(apBalance)} AP</span>
                </span>
                <ArrowUpRight size={15} className="ml-2 shrink-0 text-gray-500 transition group-hover:text-blue-300" aria-hidden="true" />
              </button>
            )}
          </header>

          {/* Give collection size priority, then make other metrics quick to scan. */}
          <section aria-label={t('Statistiques du garage')}>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-blue-500" aria-hidden="true" />
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-gray-300">
                {t('Statistiques du garage')}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
              <article className="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[24px] border border-blue-400/25 bg-gradient-to-br from-[#12233d] via-[#0e1726] to-[#0a0e15] p-5 sm:min-h-[305px] sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
                <div className="relative">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
                    <Layers3 size={23} aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-blue-200/80">
                    {t('Mon Garage')}
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-3">
                    <strong className="font-mono text-6xl font-black tracking-tighter text-white sm:text-7xl">
                      {formatNumber(stats.uniqueCards)}
                    </strong>
                    <span className="text-sm font-bold text-gray-200 sm:text-base">{t('Modèles uniques')}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400 sm:text-sm">{t('Garage distinct')}</p>
                </div>

                <Link
                  href="/collection"
                  className="relative mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-blue-300/35 bg-blue-500/15 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-blue-100 transition hover:border-blue-300/70 hover:bg-blue-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {t('MA COLLECTION')}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <article className="min-w-0 rounded-2xl border border-white/10 bg-[#10131a] p-4 sm:p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
                    <Layers3 size={19} aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">{t('Cartes totales')}</p>
                  <p className="mt-1 break-words font-mono text-3xl font-black tabular-nums text-white sm:text-4xl">
                    {formatNumber(stats.totalCards)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">{t('Dans votre collection')}</p>
                </article>

                <article className="min-w-0 rounded-2xl border border-white/10 bg-[#10131a] p-4 sm:p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                    <Wallet size={19} aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">{t('Balance AP')}</p>
                  <p className="mt-1 break-words font-mono text-3xl font-black tabular-nums text-white sm:text-4xl">
                    {formatNumber(apBalance)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">{t('Disponibles')}</p>
                </article>

                <article className="col-span-2 min-w-0 rounded-2xl border border-amber-400/15 bg-gradient-to-r from-[#17150f] to-[#10131a] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">{t('Niveau écurie')}</p>
                      <p className="mt-1 font-mono text-3xl font-black tabular-nums text-white sm:text-4xl">{garageLevel}</p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                      <Gauge size={25} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-gray-400">
                    <span>{t('Vers le prochain niveau')}</span>
                    <span className="font-mono tabular-nums text-gray-200">{progressCount} / 10</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={t('Vers le prochain niveau')}
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={progressCount}
                    className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
                  >
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-200" style={{ width: progressPercent + '%' }} />
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Direct links instead of a promotional booster listing. */}
          <section aria-label={t('Accès rapide')}>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-blue-500" aria-hidden="true" />
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-gray-300">
                {t('Accès rapide')}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DashboardShortcut href="/collection" label={t('MA COLLECTION')} icon={<Layers3 size={22} aria-hidden="true" />} />
              <DashboardShortcut href="/missions" label={t('CONTRATS')} icon={<Trophy size={22} aria-hidden="true" />} />
              <DashboardShortcut href="/marketplace" label={t('Marketplace')} icon={<ShoppingBag size={22} aria-hidden="true" />} />
            </div>
          </section>

          <aside className="flex items-start gap-3 rounded-2xl border border-blue-500/15 bg-[#0c1421] p-4 sm:p-5">
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
      className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-white/10 bg-[#10131a] p-4 transition hover:border-blue-400/40 hover:bg-[#151d2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
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
