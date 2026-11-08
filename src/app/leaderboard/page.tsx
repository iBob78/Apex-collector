'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Crown, Medal, RefreshCw, Trophy } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabaseClient';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

type LeaderboardPlayer = {
  player_rank: number;
  username: string;
  total_cards: number;
};

export default function LeaderboardPage() {
  const { language, t } = useSitePreferences();
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadLeaderboard = async () => {
    setLoading(true);
    setLoadError(false);
    const { data, error } = await supabase.rpc('get_player_leaderboard');
    if (error) {
      console.error('[LeaderboardPage] Impossible de charger le classement:', error.message);
      setLoadError(true);
    } else {
      setPlayers((data || []) as LeaderboardPlayer[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadLeaderboard();
  }, []);

  return (
    <div className="apex-paddock flex min-h-screen text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-28 md:pb-10">
        <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-7 sm:py-9 lg:px-10">
          <header className="paddock-header mb-7">
            <p className="paddock-eyebrow">{t('Pilotes Apex')}</p>
            <h1 className="paddock-title mt-3 flex items-center gap-3">
              <Trophy className="text-amber-300" size={30} />
              {t('Classement des joueurs')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              {t('Les pilotes sont classés selon le nombre total de cartes possédées. Le classement inclut tous les joueurs.')}
            </p>
          </header>

          <section className="paddock-panel overflow-hidden" aria-label={t('Classement des joueurs')}>
            <div className="grid grid-cols-[52px_minmax(0,1fr)_90px] gap-3 border-b border-[#555D65]/15 bg-[#555D65]/[.05] px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#F0EFEB] sm:grid-cols-[76px_minmax(0,1fr)_150px] sm:px-6">
              <span>{t('Rang')}</span>
              <span>{t('Pilote')}</span>
              <span className="text-right">{t('Cartes')}</span>
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#555D65] border-t-transparent" />
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                <AlertTriangle className="text-amber-300" size={26} />
                <p className="text-sm text-gray-300">{t('Impossible de charger le classement.')}</p>
                <button
                  type="button"
                  onClick={() => void loadLeaderboard()}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
                >
                  <RefreshCw size={14} /> {t('Réessayer')}
                </button>
              </div>
            ) : players.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-gray-400">{t('Aucun joueur à afficher pour le moment.')}</p>
            ) : (
              <ol>
                {players.map((player) => (
                  <li
                    key={player.player_rank}
                    className="grid grid-cols-[52px_minmax(0,1fr)_90px] items-center gap-3 border-b border-[#555D65]/[.08] px-4 py-3.5 last:border-0 hover:bg-[#555D65]/[.04] sm:grid-cols-[76px_minmax(0,1fr)_150px] sm:px-6"
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black tabular-nums ${
                      player.player_rank === 1
                        ? 'bg-amber-300/15 text-amber-200'
                        : player.player_rank === 2
                          ? 'bg-slate-300/10 text-slate-200'
                          : player.player_rank === 3
                            ? 'bg-orange-400/10 text-orange-200'
                            : 'text-gray-500'
                    }`}>
                      {player.player_rank <= 3
                        ? player.player_rank === 1 ? <Crown size={17} /> : <Medal size={17} />
                        : player.player_rank}
                    </span>
                    <Link
                      href={`/showroom/${encodeURIComponent(player.username)}`}
                      className="min-w-0 truncate rounded-lg text-sm font-bold text-gray-100 transition hover:text-[#F0EFEB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-base"
                    >
                      @{player.username}
                    </Link>
                    <span className="text-right text-sm font-black tabular-nums text-gray-200">
                      {new Intl.NumberFormat(language).format(player.total_cards)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            {t('Pour un showroom privé, seul le pseudo et le nombre total de cartes apparaissent ici.')}
          </p>
        </div>
      </main>
    </div>
  );
}
