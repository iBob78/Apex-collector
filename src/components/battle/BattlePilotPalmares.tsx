'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award, CarFront, ChevronDown, Crown, Flame, LockKeyhole,
  Medal, Shield, Swords, Trophy, Wallet,
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { resolveCardImage } from '@/lib/images';
import { supabase } from '@/lib/supabaseClient';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import {
  parsePilotPalmares,
  pilotTrophies,
  type PilotBattleCar,
  type PilotBattleHistory,
  type PilotPalmares,
} from '@/lib/battle/palmares';

const trophyIcons = [Medal, Shield, Award, Trophy, Crown, Flame];
const statLabels: Record<string, { label: string; unit: string }> = {
  power_hp: { label: 'Puissance', unit: 'HP' },
  torque_nm: { label: 'Couple', unit: 'Nm' },
  max_speed_kmh: { label: 'Vitesse', unit: 'km/h' },
  acceleration_0_100: { label: '0–100 km/h', unit: 's' },
  weight_kg: { label: 'Masse', unit: 'kg' },
  ip: { label: 'IP', unit: '' },
};

function BattleCarHighlight({
  car, label, language, metric,
}: {
  car: PilotBattleCar | null;
  label: string;
  language: string;
  metric: 'roundsWon' | 'timesUsed';
}) {
  return (
    <article className="flex min-w-0 gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#131720] sm:h-28 sm:w-28">
        {car ? (
          <SafeImage
            src={resolveCardImage({
              category: 'vehicle',
              make: car.make,
              model: car.model,
              year: Number(car.year) || 0,
              image_url: car.imageUrl,
            })}
            alt={[car.make, car.model].join(' ')}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : <CarFront className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500" size={28} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-blue-300">{label}</p>
        <p className="mt-1 break-words text-sm font-black leading-snug text-white">
          {car ? [car.make, car.model].filter(Boolean).join(' ') : 'Aucune voiture pour le moment'}
        </p>
        {car && (
          <p className="mt-2 font-mono text-lg font-bold text-emerald-300">
            {new Intl.NumberFormat(language).format(car[metric])}
            <span className="ml-1 text-[11px] font-normal text-gray-400">
              {metric === 'roundsWon' ? 'manches gagnées' : 'batailles jouées'}
            </span>
          </p>
        )}
      </div>
    </article>
  );
}

function BattleHistoryItem({ match, language }: { match: PilotBattleHistory; language: string }) {
  const result = match.winner === 'player1' ? 'Victoire' :
    match.winner === 'player2' ? 'Défaite' : 'Match nul';
  const color = match.winner === 'player1' ? 'text-emerald-300' :
    match.winner === 'player2' ? 'text-rose-300' : 'text-amber-300';
  const date = new Date(match.finishedAt);
  const displayedDate = Number.isNaN(date.valueOf()) ? 'Date inconnue' :
    new Intl.DateTimeFormat(language, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  return (
    <details className="group rounded-xl border border-white/10 bg-white/[0.035]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <p className={'text-sm font-black ' + color}>{result}</p>
          <p className="text-[11px] text-gray-400">{displayedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-base font-black tabular-nums text-white">
            {new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(match.playerPoints)}
            <span className="mx-1 text-gray-500">–</span>
            {new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(match.opponentPoints)}
          </span>
          <ChevronDown size={16} className="shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
        </div>
      </summary>
      <ol className="border-t border-white/10 px-3 py-2 sm:px-4">
        {match.rounds.map((round) => {
          const stat = statLabels[round.stat] || { label: round.stat, unit: '' };
          const won = round.winner === 'player1' ? 'Gagnée' :
            round.winner === 'player2' ? 'Perdue' : 'Égalité';
          return (
            <li key={round.roundNumber} className="flex items-center justify-between gap-2 border-b border-white/5 py-2 text-xs last:border-b-0">
              <span className="min-w-0 text-gray-300">
                <span className="font-bold text-white">#{round.roundNumber}</span>
                {' · '}{stat.label}
                <span className="ml-1 text-gray-500">({won})</span>
              </span>
              <span className="shrink-0 whitespace-nowrap font-mono tabular-nums text-gray-300">
                {new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(round.player1Value)}
                {' / '}
                {new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(round.player2Value)}
                {stat.unit ? ' ' + stat.unit : ''}
              </span>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

/**
 * A self-contained public/private palmares. The RPC is the ONLY source of
 * career stats; RLS on battle_training_matches still denies direct reads.
 * In public mode we never render earnings or match history.
 */
export default function BattlePilotPalmares({ username }: { username?: string }) {
  const { language } = useSitePreferences();
  const publicView = typeof username === 'string' && username.length > 0;
  const [data, setData] = useState<PilotPalmares | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setData(null);
    setError(null);

    void (async () => {
      const { data: result, error: rpcError } = await supabase.rpc('get_battle_pilot_palmares', {
        p_username: publicView ? username : null,
      });
      if (!live) return;
      if (rpcError) {
        setError(rpcError.code === 'PGRST202' || rpcError.code === '42883'
          ? 'Le palmarès sera disponible après activation de la migration Supabase 051.'
          : 'Impossible de charger le palmarès du pilote.');
        console.error('[BattlePilotPalmares]', rpcError.message);
      } else {
        const normalized = parsePilotPalmares(result, publicView);
        if (!normalized) setError('Palmarès indisponible pour ce joueur.');
        else setData(normalized);
      }
      setLoading(false);
    })();
    return () => { live = false; };
  }, [publicView, username]);

  if (loading) {
    return <section aria-label="Palmarès du pilote" className="animate-pulse rounded-3xl border border-white/10 bg-[#0d1018] p-6 text-sm text-gray-400">Chargement du palmarès Apex Battle…</section>;
  }
  if (error || !data) {
    return <section role="status" className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-4 text-sm text-amber-200">{error || 'Palmarès indisponible.'}</section>;
  }

  const { stats } = data;
  const medals = pilotTrophies(stats);
  const number = (value: number) => new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value);

  return (
    <section aria-label="Palmarès du pilote Apex Battle" className="space-y-5 rounded-3xl border border-blue-400/15 bg-gradient-to-b from-[#101724] via-[#090b11] to-[#08090e] p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
            <Swords size={14} /> Apex Battle
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase italic tracking-tight">Palmarès du pilote</h2>
          <p className="mt-1 text-xs text-gray-400">Entraînement · Parties enregistrées depuis l’activation</p>
        </div>
        {!publicView && (
          <Link href="/battle" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-xs font-black uppercase text-blue-200 hover:bg-blue-500/20">
            <Swords size={16} /> Jouer
          </Link>
        )}
      </header>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[{ name: 'Victoires', value: stats.wins, tone: 'text-emerald-300' },
          { name: 'Défaites', value: stats.losses, tone: 'text-rose-300' },
          { name: 'Nuls', value: stats.draws, tone: 'text-amber-300' }].map((item) => (
          <div key={item.name} className="rounded-xl border border-white/10 bg-black/25 p-3 text-center sm:p-4">
            <p className={'font-mono text-2xl font-black tabular-nums sm:text-3xl ' + item.tone}>{number(item.value)}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gray-400 sm:text-xs">{item.name}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 sm:p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-gray-300">Taux de victoire</span>
          <span className="font-mono font-black text-white">{number(stats.winRate)} %</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10" role="progressbar"
          aria-label="Taux de victoire" aria-valuenow={stats.winRate} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-emerald-500" style={{ width: Math.max(0, Math.min(100, stats.winRate)) + '%' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Batailles', value: number(stats.battles) },
          { label: 'Meilleure série', value: number(stats.bestStreak) },
          { label: 'Série actuelle', value: number(stats.currentStreak) },
          { label: 'Meilleur score', value: number(stats.bestScore) + '/10' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
            <p className="mt-2 font-mono text-xl font-black tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      {data.isOwner && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <Wallet size={20} className="shrink-0 text-emerald-300" />
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">AC gagnés en Battle</p>
              <p className="font-mono text-xl font-black">{number(stats.earnedAc ?? 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
            <Trophy size={20} className="shrink-0 text-amber-300" />
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400">Boosters gagnés</p>
              <p className="font-mono text-xl font-black">{number(stats.boostersEarned)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <BattleCarHighlight car={data.topWinner} label="Voiture la plus victorieuse" language={language} metric="roundsWon" />
        <BattleCarHighlight car={data.mostUsed} label="Voiture la plus utilisée" language={language} metric="timesUsed" />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Trophy size={18} className="text-amber-300" />
          <h3 className="text-sm font-black uppercase tracking-wider">Trophées Apex Battle</h3>
          <span className="ml-auto text-xs text-gray-500">{medals.filter((item) => item.unlocked).length}/6</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {medals.map((trophy, index) => {
            const Icon = trophyIcons[index];
            return (
              <div key={trophy.id} className={'flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center ' +
                (trophy.unlocked ? 'border-amber-300/30 bg-amber-300/[0.07]' : 'border-white/10 bg-white/[0.02] opacity-50')}>
                {trophy.unlocked ? <Icon size={27} className="text-amber-200" /> : <LockKeyhole size={25} className="text-gray-500" />}
                <p className="mt-1 text-[11px] font-black leading-tight">{trophy.name}</p>
                <p className="text-[10px] leading-tight text-gray-400">{trophy.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {data.isOwner && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider">
            <Medal size={18} className="text-blue-300" />
            Historique des 20 dernières batailles
          </h3>
          {data.history.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm text-gray-400">
              Aucun match terminé enregistré pour le moment.
            </p>
          ) : (
            <div className="space-y-2">
              {data.history.map((match) => <BattleHistoryItem key={match.id} match={match} language={language} />)}
            </div>
          )}
          <p className="mt-2 text-[11px] text-gray-500">
            Les détails des manches restent privés. Les performances contre d’autres joueurs seront comptabilisées séparément dans une future version PvP.
          </p>
        </div>
      )}
    </section>
  );
}
