'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, RotateCcw, Search, ShieldQuestion, Swords, Trophy, Zap } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllPages } from '@/lib/fetchAllPages';
import type { VehicleCard } from '@/types/game';
import {
  BATTLE_DECK_SIZE,
  BATTLE_STATS,
  BATTLE_STAT_KEYS,
  type BattleMatchState,
  type BattleStat,
  type BattleVehicleSource,
  getAvailableBattleStats,
  getBattleScore,
  getNextBattleChooser,
  normalizeBattleVehicle,
  playBattleRound,
} from '@/lib/battle/engine';
import { chooseTrainingStat, startTrainingMatch } from '@/lib/battle/training';

type CatalogVehicle = BattleVehicleSource & {
  id: string;
  name: string | null;
  make: string | null;
  model: string | null;
  year: string | number | null;
  rarity: string;
  image_url: string | null;
  is_active: boolean;
};

type OwnershipRow = { card_id: string | null; count: number | null };

function vehicleTitle(card: CatalogVehicle): string {
  const name = [card.make, card.model].filter(Boolean).join(' ').trim();
  return name || card.name || 'Véhicule';
}

function BattleCard({ vehicle, concealed = false, onSelect }: {
  vehicle?: CatalogVehicle | null;
  concealed?: boolean;
  onSelect?: () => void;
}) {
  if (concealed || !vehicle) {
    return (
      <div role="img" aria-label="Carte adverse cachée" className="relative flex aspect-[2/3] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-blue-300/25 bg-[radial-gradient(ellipse_at_center,_#132647_0%,_#090f1d_60%,_#05070d_100%)] text-blue-100 shadow-xl">
        <div className="absolute inset-3 rounded-xl border border-dashed border-blue-200/20" aria-hidden="true" />
        <ShieldQuestion size={48} className="relative text-blue-300" aria-hidden="true" />
        <span className="relative mt-3 text-center text-xs font-black uppercase tracking-[0.2em]">Apex Battle</span>
        <span className="relative mt-1 text-[10px] uppercase tracking-wide text-blue-200/60">Carte mystère</span>
      </div>
    );
  }

  return (
    <Card
      {...({ ...vehicle, year: Number(vehicle.year) || 0, category: 'vehicle' } as unknown as VehicleCard)}
      compact
      showLevel={false}
      onCardClick={onSelect ?? (() => { /* Dans le duel, rester sur la page battle. */ })}
    />
  );
}

function formatBattleValue(value: number, stat: BattleStat): string {
  const digits = stat === 'acceleration_0_100' ? 2 : Number.isInteger(value) ? 0 : 1;
  return value.toLocaleString('fr-FR', { maximumFractionDigits: digits });
}

export default function ApexBattlePage() {
  const reducedMotion = Boolean(useReducedMotion());
  const [authStatus, setAuthStatus] = useState<'loading' | 'signedOut' | 'ready'>('loading');
  const [catalog, setCatalog] = useState<CatalogVehicle[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<BattleMatchState | null>(null);
  const [opponentCards, setOpponentCards] = useState<CatalogVehicle[]>([]);
  const [playerCards, setPlayerCards] = useState<CatalogVehicle[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!mounted) return;
        if (authError || !user) {
          setAuthStatus('signedOut');
          return;
        }

        const [vehicles, ownership] = await Promise.all([
          fetchAllPages((from, to) => supabase
            .from('cards')
            .select('id,card_id,name,make,model,year,rarity,image_url,is_active,variant_of_card_id,power_hp,torque_nm,max_speed_kmh,acceleration_0_100,weight_t')
            .eq('is_active', true).order('id').range(from, to)),
          fetchAllPages((from, to) => supabase
            .from('user_cards')
            .select('id,card_id,count').eq('user_id', user.id).order('id').range(from, to)),
        ]);
        if (!mounted) return;
        const usable = (vehicles as CatalogVehicle[]).filter((vehicle) => {
          try {
            normalizeBattleVehicle(vehicle);
            return true;
          } catch {
            return false;
          }
        });
        const owned = new Set((ownership as OwnershipRow[])
          .filter((item) => Number(item.count) > 0 && item.card_id)
          .map((item) => String(item.card_id).toLowerCase()));
        setCatalog(usable);
        setOwnedIds(owned);
        setAuthStatus('ready');
      } catch (cause) {
        if (!mounted) return;
        setError(cause instanceof Error ? cause.message : 'Impossible de charger votre collection.');
        setAuthStatus('ready');
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const carsById = useMemo(
    () => new Map(catalog.map((vehicle) => [vehicle.card_id.toLowerCase(), vehicle])),
    [catalog],
  );
  const ownedCars = useMemo(
    () => catalog.filter((vehicle) => ownedIds.has(vehicle.card_id.toLowerCase())),
    [catalog, ownedIds],
  );
  const filteredCars = useMemo(() => {
    const searched = query.trim().toLowerCase();
    return ownedCars.filter((card) =>
      !searched || vehicleTitle(card).toLowerCase().includes(searched) ||
        String(card.year ?? '').includes(searched),
    ).sort((a, b) => vehicleTitle(a).localeCompare(vehicleTitle(b), 'fr'));
  }, [ownedCars, query]);
  const selectedCards = useMemo(
    () => selectedIds.flatMap((id) => {
      const card = carsById.get(id);
      return card ? [card] : [];
    }),
    [selectedIds, carsById],
  );
  const score = match ? getBattleScore(match) : null;
  const finishedScreen = Boolean(match && score?.finished && !revealed);
  const chooser = match ? getNextBattleChooser(match) : null;
  const lastRound = match?.rounds[match.rounds.length - 1] ?? null;
  const cardIndex = match ? Math.min(BATTLE_DECK_SIZE - 1, match.rounds.length - (revealed ? 1 : 0)) : 0;
  const nextStats = match ? getAvailableBattleStats(match) : [];

  const toggleCard = (card: CatalogVehicle) => {
    if (match) return;
    setError(null);
    const id = card.card_id.toLowerCase();
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= BATTLE_DECK_SIZE) return current;
      const canonicalId = normalizeBattleVehicle(card).canonicalCardId.toLowerCase();
      if (current.some((item) => {
        const existing = carsById.get(item);
        return existing && normalizeBattleVehicle(existing).canonicalCardId.toLowerCase() === canonicalId;
      })) {
        setError('Ce modèle est déjà sélectionné : les variantes ne comptent pas comme des voitures différentes.');
        return current;
      }
      return [...current, id];
    });
  };

  const moveCard = (index: number, offset: number) => {
    setSelectedIds((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const start = () => {
    try {
      if (selectedCards.length !== BATTLE_DECK_SIZE) throw new Error('Sélectionne dix cartes pour commencer.');
      const training = startTrainingMatch(selectedCards, catalog);
      const opponent = training.opponent.map((source) => carsById.get(source.card_id.toLowerCase()));
      if (opponent.some((vehicle) => !vehicle)) {
        throw new Error('Impossible de préparer les cartes adverses.');
      }
      setPlayerCards(selectedCards);
      setOpponentCards(opponent as CatalogVehicle[]);
      setMatch(training.match);
      setRevealed(false);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de lancer la bataille.');
    }
  };

  const selectStat = (stat: BattleStat) => {
    if (!match || revealed || getNextBattleChooser(match) !== 'player1') return;
    try {
      setMatch(playBattleRound(match, 'player1', stat));
      setRevealed(true);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Choix invalide.');
    }
  };

  // L'ordinateur utilise uniquement les données de SA carte (pas celles du joueur).
  useEffect(() => {
    if (!match || revealed || match.rounds.length >= BATTLE_DECK_SIZE || getNextBattleChooser(match) !== 'player2') return;
    const timer = window.setTimeout(() => {
      try {
        const stat = chooseTrainingStat(match);
        setMatch(playBattleRound(match, 'player2', stat));
        setRevealed(true);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Erreur pendant le tour adverse.');
      }
    }, reducedMotion ? 0 : 800);
    return () => window.clearTimeout(timer);
  }, [match, revealed, reducedMotion]);

  const restart = () => {
    setMatch(null);
    setPlayerCards([]);
    setOpponentCards([]);
    setRevealed(false);
    setError(null);
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 py-7 sm:px-7 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.3em] text-blue-400">Apex Collector / Arena</p>
              <h1 className="text-4xl font-black uppercase italic tracking-tight sm:text-5xl">Apex <span className="text-blue-400">Battle</span></h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">Dix voitures. Dix manches. Six caractéristiques. À toi de choisir la bonne statistique au bon moment.</p>
            </div>
            <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-blue-200">Entraînement solo</span>
          </header>

          <div className="flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] px-4 py-3 text-xs text-amber-100">
            <Zap size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>Mode d’essai contre l’ordinateur. Les cartes restent dans ton garage, aucune mise ni récompense AC, aucun classement enregistré. Les duels entre joueurs arriveront ensuite.</p>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
              {!match && authStatus === 'ready' && (
                <button type="button" onClick={() => window.location.reload()} className="ml-3 underline underline-offset-4">Recharger</button>
              )}
            </div>
          )}

          {authStatus === 'loading' && (
            <p role="status" className="rounded-xl border border-white/10 bg-[#111720] p-6 text-gray-300">Chargement de ta collection…</p>
          )}

          {authStatus === 'signedOut' && (
            <section className="rounded-2xl border border-blue-300/20 bg-[#111720] p-6">
              <h2 className="text-xl font-black">Connecte-toi pour jouer</h2>
              <p className="mt-2 text-sm text-gray-400">L'entraînement utilise uniquement les véhicules que tu possèdes.</p>
              <Link className="mt-4 inline-flex rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold text-white" href="/login">Se connecter</Link>
            </section>
          )}

          {authStatus === 'ready' && !match && (
            <>
              <section className="grid gap-4 lg:grid-cols-[1fr_300px]">
                <div className="rounded-2xl border border-white/10 bg-[#0e1219] p-4 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-wide">01 / Choisis ton équipe</h2>
                      <p className="text-xs text-gray-400">Clique sur dix modèles différents, puis ajuste leur ordre.</p>
                    </div>
                    <span className="rounded-lg bg-blue-500/15 px-3 py-2 font-mono text-sm font-black text-blue-200">{selectedIds.length} / {BATTLE_DECK_SIZE}</span>
                  </div>
                  <label className="mb-4 flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 text-gray-400">
                    <Search size={18} aria-hidden="true" />
                    <span className="sr-only">Rechercher un véhicule</span>
                    <input
                      value={query}
                      onChange={(event) => { setQuery(event.target.value); setVisibleCount(24); }}
                      placeholder="Marque, modèle ou année…"
                      className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-500"
                    />
                  </label>
                  {ownedCars.length < BATTLE_DECK_SIZE && (
                    <div className="mb-4 rounded-lg border border-blue-400/20 bg-blue-500/10 p-3 text-sm text-blue-100">
                      Tu possèdes {ownedCars.length} voitures éligibles. Il faut en avoir dix différentes pour lancer une bataille. <Link href="/collection" className="font-bold underline underline-offset-4">Voir ma collection</Link>
                    </div>
                  )}
                  {filteredCars.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-400">Aucune carte possédée ne correspond à cette recherche.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {filteredCars.slice(0, visibleCount).map((vehicle) => {
                        const chosen = selectedIds.includes(vehicle.card_id.toLowerCase());
                        const position = selectedIds.indexOf(vehicle.card_id.toLowerCase()) + 1;
                        return (
                          <div key={vehicle.card_id} className="relative min-w-0">
                            <div className={chosen ? 'rounded-xl ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0e1219]' : ''}>
                              <BattleCard vehicle={vehicle} onSelect={() => toggleCard(vehicle)} />
                            </div>
                            <button
                              type="button"
                              aria-label={chosen ? 'Retirer ' + vehicleTitle(vehicle) : 'Ajouter ' + vehicleTitle(vehicle)}
                              aria-pressed={chosen}
                              disabled={!chosen && selectedIds.length === BATTLE_DECK_SIZE}
                              onClick={() => toggleCard(vehicle)}
                              className={'mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-40 ' + (chosen ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-200' : 'border-white/15 bg-white/[0.04] text-gray-200 hover:bg-blue-500/10')}
                            >
                              {chosen ? <><Check size={14} /> Position {position} · Retirer</> : <>Ajouter <ArrowRight size={14}/></>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {filteredCars.length > visibleCount && (
                    <button type="button" onClick={() => setVisibleCount((count) => count + 24)}
                      className="mt-5 min-h-11 w-full rounded-lg border border-white/20 text-sm font-bold hover:bg-white/10">
                      Afficher plus de voitures
                    </button>
                  )}
                </div>

                <aside className="self-start rounded-2xl border border-blue-400/20 bg-[#0d1523] p-4 lg:sticky lg:top-6">
                  <h2 className="text-sm font-black uppercase tracking-wider text-blue-100">02 / Ordre de bataille</h2>
                  <p className="mb-3 mt-1 text-xs text-gray-400">La position 1 affronte la position 1 de l’ordinateur.</p>
                  <ol className="space-y-2">
                    {Array.from({ length: BATTLE_DECK_SIZE }, (_, index) => {
                      const card = selectedCards[index];
                      return (
                        <li key={index} className="flex min-h-12 items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/20 text-xs font-black text-blue-200">{index + 1}</span>
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-200">{card ? vehicleTitle(card) : 'Emplacement libre'}</span>
                          {card && (
                            <div className="flex shrink-0 gap-1">
                              <button type="button" aria-label={'Monter ' + vehicleTitle(card)} disabled={index === 0}
                                onClick={() => moveCard(index, -1)} className="rounded-md p-1.5 hover:bg-white/10 disabled:opacity-25"><ArrowUp size={15}/></button>
                              <button type="button" aria-label={'Descendre ' + vehicleTitle(card)} disabled={index === selectedIds.length - 1}
                                onClick={() => moveCard(index, 1)} className="rounded-md p-1.5 hover:bg-white/10 disabled:opacity-25"><ArrowDown size={15}/></button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  <button type="button" disabled={selectedCards.length !== BATTLE_DECK_SIZE} onClick={start}
                    className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400">
                    <Swords size={18} aria-hidden="true" /> Démarrer la bataille
                  </button>
                  <p className="mt-2 text-center text-[11px] text-gray-500">Partie locale sans mise en jeu de cartes ni d’AC</p>
                </aside>
              </section>
            </>
          )}

          {authStatus === 'ready' && match && score && finishedScreen && (
            <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/15 bg-gradient-to-b from-[#13233a] to-[#090b10] p-5 text-center sm:p-9">
              <Trophy size={52} className="mx-auto text-amber-300" aria-hidden="true" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-blue-300">Résultat après 10 manches</p>
              <h2 className="mt-3 text-4xl font-black uppercase sm:text-5xl">{score.winner === 'player1' ? 'Victoire !' : score.winner === 'player2' ? 'Défaite' : 'Match nul'}</h2>
              <div className="my-7 flex items-center justify-center gap-8 font-mono text-4xl font-black tabular-nums sm:text-6xl">
                <span>{score.player1}</span><span className="text-gray-500">—</span><span>{score.player2}</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Toi <span className="mx-3">·</span> Ordinateur</p>
              <div className="mt-7 space-y-2 text-left">
                {match.rounds.map((round) => (
                  <div key={round.roundNumber} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs">
                    <span className="w-7 shrink-0 font-mono text-blue-300">{round.roundNumber}/10</span>
                    <span className="min-w-0 flex-1 truncate">{BATTLE_STATS[round.stat].label}</span>
                    <span className="font-mono text-gray-300">{round.player1Points} – {round.player2Points}</span>
                    <span className={'w-14 text-right font-black ' + (round.winner === 'player1' ? 'text-emerald-300' : round.winner === 'player2' ? 'text-rose-300' : 'text-gray-300')}>
                      {round.winner === 'tie' ? 'Nul' : round.winner === 'player1' ? 'Gagné' : 'Perdu'}
                    </span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={restart} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-black uppercase hover:bg-blue-400">
                <RotateCcw size={18}/> Rejouer avec mon équipe
              </button>
            </section>
          )}

          {authStatus === 'ready' && match && score && !finishedScreen && (
            <section className="mx-auto w-full max-w-5xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0d111a] p-4">
                <button type="button" onClick={restart} className="flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-bold text-gray-300 hover:bg-white/10"><ArrowLeft size={16}/> Quitter l’entraînement</button>
                <span className="text-xs font-black uppercase tracking-widest text-blue-300">Manche {Math.min(BATTLE_DECK_SIZE, cardIndex + 1)} / {BATTLE_DECK_SIZE}</span>
                <div className="font-mono text-xl font-black tabular-nums"><span className="text-emerald-300">{score.player1}</span> <span className="text-gray-600">—</span> <span className="text-rose-300">{score.player2}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                <div className="min-w-0">
                  <p className="mb-2 text-center text-xs font-black uppercase tracking-widest text-emerald-300">Ton véhicule</p>
                  <motion.div key={'player-' + cardIndex} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mx-auto max-w-[260px]">
                    <BattleCard vehicle={playerCards[cardIndex]}/>
                  </motion.div>
                </div>
                <div className="min-w-0">
                  <p className="mb-2 text-center text-xs font-black uppercase tracking-widest text-rose-300">Ordinateur</p>
                  <motion.div key={'opponent-' + cardIndex + '-' + String(revealed)}
                    initial={reducedMotion ? false : { opacity: 0.4, rotateY: revealed ? 75 : 0 }}
                    animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: 0.45 }}
                    className="mx-auto max-w-[260px]">
                    <BattleCard vehicle={opponentCards[cardIndex]} concealed={!revealed}/>
                  </motion.div>
                </div>
              </div>

              {revealed && lastRound ? (
                <div role="status" aria-live="polite" className="rounded-2xl border border-blue-300/20 bg-[#101827] p-4 text-center sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Statistique : {BATTLE_STATS[lastRound.stat].label}</p>
                  <div className="mt-3 grid grid-cols-3 items-center gap-2">
                    <p className="font-mono text-xl font-black tabular-nums text-emerald-200 sm:text-3xl">
                      {formatBattleValue(lastRound.player1Value, lastRound.stat)}
                    </p>
                    <span className="text-xs text-gray-400">{BATTLE_STATS[lastRound.stat].unit}</span>
                    <p className="font-mono text-xl font-black tabular-nums text-rose-200 sm:text-3xl">
                      {formatBattleValue(lastRound.player2Value, lastRound.stat)}
                    </p>
                  </div>
                  <h3 className="mt-4 text-xl font-black uppercase">
                    {lastRound.winner === 'tie' ? 'Égalité · 0,5 point chacun' : lastRound.winner === 'player1' ? 'Tu gagnes cette manche !' : 'L’ordinateur gagne cette manche'}
                  </h3>
                  <button type="button" onClick={() => setRevealed(false)}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-500 px-6 text-sm font-black hover:bg-blue-400">
                    {score.finished ? 'Afficher le résultat final' : 'Manche suivante'} <ArrowRight size={17}/>
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#0d111a] p-4 sm:p-6">
                  {chooser === 'player1' ? (
                    <>
                      <h2 className="text-center text-lg font-black uppercase">À toi de choisir la caractéristique</h2>
                      <p className="mt-1 text-center text-xs text-gray-400">La meilleure valeur l’emporte. Masse et 0–100 : la plus petite valeur gagne.</p>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {BATTLE_STAT_KEYS.map((stat) => {
                          const used = match.rounds.filter((round) => round.selectedBy === 'player1' && round.stat === stat).length;
                          const enabled = nextStats.includes(stat);
                          return (
                            <button type="button" key={stat} disabled={!enabled} onClick={() => selectStat(stat)}
                              className="min-h-20 rounded-xl border border-blue-300/20 bg-blue-500/[0.08] p-3 text-left transition hover:border-blue-300/70 hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.02] disabled:opacity-35">
                              <span className="block text-xs font-black uppercase">{BATTLE_STATS[stat].label}</span>
                              <span className="mt-1 block font-mono text-sm font-bold text-blue-200">
                                {match.player1Deck[cardIndex].stats[stat].toLocaleString('fr-FR')} {BATTLE_STATS[stat].unit}
                              </span>
                              <span className="mt-1 block text-[10px] text-gray-400">{used}/2 utilisations</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p role="status" className="py-6 text-center text-sm font-bold text-blue-200">L’ordinateur choisit sa caractéristique…</p>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
