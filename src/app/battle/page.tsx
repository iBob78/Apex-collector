'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, RotateCcw, Search, ShieldQuestion, Star, Swords, Trophy, Zap } from 'lucide-react';
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
  type BattleVehicleSnapshot,
  type BattleStat,
  getAvailableBattleStats,
  getBattleScore,
  getNextBattleChooser,
  normalizeBattleVehicle,
  playBattleRound,
} from '@/lib/battle/engine';
import { chooseTrainingStat, startTrainingMatch } from '@/lib/battle/training';
import { battleCardStats, formatBattleStat } from '@/lib/battle/display';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import {
  BATTLE_RARITIES,
  type BattleSelectionSort,
  type BattleSelectionVehicle,
  filterAndSortBattleVehicles,
  getBattleVehicleName,
} from '@/lib/battle/selection';

type CatalogVehicle = BattleSelectionVehicle & {
  id: string;
  name: string | null;
  make: string | null;
  model: string | null;
  year: string | number | null;
  rarity: string;
  image_url: string | null;
  is_active: boolean;
  // Matching the Card component's country flag and HP -> CV presentation.
  country_code?: string | null;
  country?: string | null;
  power_kw?: number | string | null;
};

type OwnershipRow = { card_id: string | null; count: number | null; upgrade_level?: number | null };

function vehicleTitle(card: CatalogVehicle): string {
  return getBattleVehicleName(card);
}

function BattleCard({ vehicle, concealed = false, onSelect, mobileGrid = false, level = 0, isFavorite = false, snapshot }: {
  vehicle?: CatalogVehicle | null;
  concealed?: boolean;
  onSelect?: () => void;
  mobileGrid?: boolean;
  level?: number;
  isFavorite?: boolean;
  snapshot?: BattleVehicleSnapshot;
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
      {...({
        ...vehicle,
        ...(snapshot ? battleCardStats(snapshot) : {}),
        year: Number(vehicle.year) || 0,
        category: 'vehicle',
      } as unknown as VehicleCard)}
      compact={!mobileGrid && !snapshot}
      mobileGrid={mobileGrid}
      showLevel={mobileGrid}
      upgradeLevel={mobileGrid ? level : 0}
      isFavorite={isFavorite}
      onCardClick={onSelect ?? (() => { /* Dans le duel, rester sur la page battle. */ })}
    />
  );
}

/**
 * La collection compose ses cartes à une largeur confortable. Sur mobile,
 * une base de 270 px agrandit légèrement les détails tout en préservant la lisibilité.
 * Sur smartphone, dessiner la carte à cette taille AVANT de la réduire :
 * les badges, noms, chiffres et colonnes de statistiques gardent ainsi
 * leurs proportions, sans passer à la ligne comme à 180 px.
 * Le mode ordinateur garde le rendu Card normal sans changement d'échelle.
 */
function ScaledDuelCard({
  vehicle,
  concealed,
  snapshot,
}: {
  vehicle?: CatalogVehicle | null;
  concealed?: boolean;
  snapshot?: BattleVehicleSnapshot;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ width: number; mobile: boolean } | null>(null);
  const referenceWidth = 270;

  useLayoutEffect(() => {
    const container = frameRef.current;
    if (!container) return;

    // clientWidth, contrairement à getBoundingClientRect, ignore les rotations
    // de la révélation et empêche les variations de taille pendant le retournement.
    const updateLayout = () => setLayout({
      width: container.clientWidth,
      mobile: window.innerWidth < 640,
    });
    updateLayout();
    window.addEventListener('resize', updateLayout);
    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', updateLayout);
    }
    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateLayout);
    };
  }, []);

  const scaled = layout !== null && layout.mobile && layout.width < referenceWidth;
  const scale = scaled ? layout.width / referenceWidth : 1;

  return (
    <div ref={frameRef} className="relative aspect-[2/3] w-full min-w-0">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: scaled ? referenceWidth : '100%',
          transform: scaled ? `scale(${scale})` : undefined,
          visibility: layout === null ? 'hidden' : 'visible',
        }}
      >
        <BattleCard vehicle={vehicle} concealed={concealed} snapshot={snapshot} />
      </div>
    </div>
  );
}

export default function ApexBattlePage() {
  const { units, language } = useSitePreferences();
  const reducedMotion = Boolean(useReducedMotion());
  const [authStatus, setAuthStatus] = useState<'loading' | 'signedOut' | 'ready'>('loading');
  const [catalog, setCatalog] = useState<CatalogVehicle[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteCardIds, setFavoriteCardIds] = useState<Set<string>>(() => new Set());
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState('All');
  const [sortBy, setSortBy] = useState<BattleSelectionSort>('name');
  const [levelsByCardId, setLevelsByCardId] = useState<Record<string, number>>({});
  const [visibleCount, setVisibleCount] = useState(24);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<BattleMatchState | null>(null);
  const [opponentCards, setOpponentCards] = useState<CatalogVehicle[]>([]);
  const [playerCards, setPlayerCards] = useState<CatalogVehicle[]>([]);
  const [revealed, setRevealed] = useState(false);

  // Comme dans la collection, un changement de filtre réinitialise les 24 cartes affichées.
  useEffect(() => setVisibleCount(24), [query, favoritesOnly, rarityFilter, sortBy]);

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

        const [vehicles, ownership, favorites] = await Promise.all([
          fetchAllPages((from, to) => supabase
            .from('cards')
            .select('*')
            .eq('is_active', true).order('id').range(from, to)),
          fetchAllPages((from, to) => supabase
            .from('user_cards')
            .select('id,card_id,count,upgrade_level').eq('user_id', user.id).order('id').range(from, to)),
          fetchAllPages((from, to) => supabase
            .from('card_favorites')
            .select('category,card_id')
            .eq('user_id', user.id)
            .order('category').order('card_id').range(from, to))
            .catch((cause) => {
              console.warn('[ApexBattle] Favoris indisponibles :', cause);
              if (mounted) setFavoritesError('Impossible de charger les favoris.');
              return null;
            }),
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
        const owned = new Set<string>();
        const levels: Record<string, number> = {};
        for (const item of ownership as OwnershipRow[]) {
          if (Number(item.count) <= 0 || !item.card_id) continue;
          const id = String(item.card_id).toLowerCase().trim();
          owned.add(id);
          levels[id] = Math.max(levels[id] ?? 0, Number(item.upgrade_level) || 0);
        }
        setCatalog(usable);
        setOwnedIds(owned);
        setLevelsByCardId(levels);
        if (favorites !== null) {
          setFavoriteCardIds(new Set(favorites
            .filter((item) => item.category === 'vehicle')
            .map((item) => String(item.card_id).toLowerCase().trim())));
          setFavoritesError(null);
        }
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
  const filteredCars = useMemo(() => filterAndSortBattleVehicles(ownedCars, {
    query,
    rarity: rarityFilter,
    favoritesOnly,
    favoriteCardIds,
    sortBy,
    levelsByCardId,
  }), [ownedCars, query, rarityFilter, favoritesOnly, favoriteCardIds, sortBy, levelsByCardId]);
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
  const isPlaying = Boolean(match && !finishedScreen);

  // Démarrer chaque manche en haut de l'arène, même si l'utilisateur était
  // descendu dans sa collection au moment de lancer l'entraînement.
  useLayoutEffect(() => {
    if (!match) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [match, revealed]);

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

  /** Replay begins a fresh match right away, preserving the same ten cars and their order. */
  const replaySameTeam = () => {
    if (!match || !getBattleScore(match).finished) return;
    start();
  };

  /** Return to deck preparation with the current selection prefilled for editing. */
  const changeTeam = () => {
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
        <div className={`mx-auto flex w-full max-w-[1480px] flex-col sm:gap-6 sm:px-7 sm:py-7 lg:px-10 ${isPlaying ? 'gap-2 px-3 py-2' : 'gap-6 px-4 py-7'}`}>
          <header className={`flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 ${isPlaying ? 'hidden sm:flex' : ''}`}>
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.3em] text-blue-400">Apex Collector / Arena</p>
              <h1 className="text-4xl font-black uppercase italic tracking-tight sm:text-5xl">Apex <span className="text-blue-400">Battle</span></h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">Dix voitures. Dix manches. Six caractéristiques. À toi de choisir la bonne statistique au bon moment.</p>
            </div>
            <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-blue-200">Entraînement solo</span>
          </header>

          <div className={`items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] px-4 py-3 text-xs text-amber-100 ${isPlaying ? 'hidden sm:flex' : 'flex'}`}>
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
              <p className="mt-2 text-sm text-gray-400">L’entraînement utilise uniquement les véhicules que tu possèdes.</p>
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
                  <div className="mb-4 flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:p-3">
                    <button
                      type="button"
                      aria-pressed={favoritesOnly}
                      onClick={() => setFavoritesOnly((current) => !current)}
                      className={'flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ' + (favoritesOnly ? 'border-amber-400/70 bg-amber-400/20 text-amber-200' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10')}
                    >
                      <Star size={17} fill={favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" />
                      Favoris ({ownedCars.filter((card) => favoriteCardIds.has(card.card_id.toLowerCase())).length})
                    </button>
                    <label className="flex min-h-11 w-full min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-gray-300 sm:min-w-[180px]">
                      <Search size={18} className="shrink-0" aria-hidden="true" />
                      <span className="sr-only">Rechercher un véhicule</span>
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Rechercher une carte..."
                        className="min-w-0 w-full bg-transparent py-3 text-base text-white outline-none placeholder:text-gray-500 sm:text-sm"
                      />
                    </label>
                    <select
                      aria-label="Filtrer par rareté"
                      value={rarityFilter}
                      onChange={(event) => setRarityFilter(event.target.value)}
                      className="min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#151b25] px-3 text-base text-white outline-none sm:w-auto sm:text-sm"
                    >
                      <option value="All">Toutes les raretés</option>
                      {BATTLE_RARITIES.map((rarity) => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                      ))}
                    </select>
                    <select
                      aria-label="Trier les voitures"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as BattleSelectionSort)}
                      className="min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#151b25] px-3 text-base text-white outline-none sm:w-auto sm:text-sm"
                    >
                      <option value="name">Trier par Nom</option>
                      <option value="make-asc">Marques, A à Z</option>
                      <option value="make-desc">Marques, Z à A</option>
                      <option value="ip-desc">IP, décroissant</option>
                      <option value="ip-asc">IP, croissant</option>
                      <option value="level-asc">Niveau, croissant</option>
                      <option value="level-desc">Niveau, décroissant</option>
                      <option value="rarity">Trier par Rareté</option>
                      <option value="newest">Plus récent</option>
                    </select>
                  </div>
                  {favoritesError && (
                    <p role="alert" className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">{favoritesError}</p>
                  )}
                  <p className="mb-3 text-xs text-gray-400">
                    {filteredCars.length} voiture{filteredCars.length > 1 ? 's' : ''} disponible{filteredCars.length > 1 ? 's' : ''} · uniquement les voitures possédées et éligibles
                  </p>
                  {ownedCars.length < BATTLE_DECK_SIZE && (
                    <div className="mb-4 rounded-lg border border-blue-400/20 bg-blue-500/10 p-3 text-sm text-blue-100">
                      Tu possèdes {ownedCars.length} voitures éligibles. Il faut en avoir dix différentes pour lancer une bataille. <Link href="/collection" className="font-bold underline underline-offset-4">Voir ma collection</Link>
                    </div>
                  )}
                  {filteredCars.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-400">Aucune carte possédée ne correspond à cette recherche.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-x-1.5 gap-y-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),1fr))] sm:gap-x-6 sm:gap-y-8">
                      {filteredCars.slice(0, visibleCount).map((vehicle) => {
                        const chosen = selectedIds.includes(vehicle.card_id.toLowerCase());
                        const position = selectedIds.indexOf(vehicle.card_id.toLowerCase()) + 1;
                        return (
                          <div key={vehicle.card_id} className="relative min-w-0">
                            <div className={chosen ? 'rounded-xl ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0e1219]' : ''}>
                              <BattleCard
                                vehicle={vehicle}
                                onSelect={() => toggleCard(vehicle)}
                                mobileGrid
                                level={levelsByCardId[vehicle.card_id.toLowerCase()] ?? 0}
                                isFavorite={favoriteCardIds.has(vehicle.card_id.toLowerCase())}
                              />
                            </div>
                            <button
                              type="button"
                              aria-label={chosen ? 'Retirer ' + vehicleTitle(vehicle) : 'Ajouter ' + vehicleTitle(vehicle)}
                              aria-pressed={chosen}
                              disabled={!chosen && selectedIds.length === BATTLE_DECK_SIZE}
                              onClick={() => toggleCard(vehicle)}
                              className={'mt-1 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg border px-0.5 text-[10px] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-40 sm:mt-2 sm:min-h-10 sm:gap-2 sm:px-2 sm:text-xs ' + (chosen ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-200' : 'border-white/15 bg-white/[0.04] text-gray-200 hover:bg-blue-500/10')}
                            >
                              <span className="sm:hidden">{chosen ? `N° ${position}` : 'Ajouter +'}</span>
                              <span className="hidden sm:inline">{chosen ? `Position ${position} · Retirer` : 'Ajouter'}</span>
                              {chosen ? <Check size={13} className="hidden shrink-0 sm:block" /> : <ArrowRight size={13} className="hidden shrink-0 sm:block" />}
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
              <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={replaySameTeam}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-black uppercase hover:bg-blue-400">
                  <RotateCcw size={18}/> Rejouer avec mon équipe
                </button>
                <button type="button" onClick={changeTeam}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-black uppercase hover:bg-white/10">
                  <ArrowLeft size={18}/> Changer d’équipe
                </button>
              </div>
            </section>
          )}

          {authStatus === 'ready' && match && score && !finishedScreen && (
            <section className="mx-auto w-full max-w-5xl space-y-2 sm:space-y-5">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0d111a] p-2 sm:flex-wrap sm:gap-3 sm:rounded-2xl sm:p-4">
                <button type="button" onClick={changeTeam} className="flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-white/15 px-2 text-[10px] font-bold text-gray-300 hover:bg-white/10 sm:min-h-10 sm:gap-2 sm:px-3 sm:text-xs"><ArrowLeft size={15}/> <span className="sm:hidden">Quitter</span><span className="hidden sm:inline">Quitter l’entraînement</span></button>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 sm:text-xs sm:tracking-widest">Manche {Math.min(BATTLE_DECK_SIZE, cardIndex + 1)} / {BATTLE_DECK_SIZE}</span>
                <div className="shrink-0 font-mono text-base font-black tabular-nums sm:text-xl"><span className="text-emerald-300">{score.player1}</span> <span className="text-gray-600">—</span> <span className="text-rose-300">{score.player2}</span></div>
              </div>

              <div className="grid min-w-0 grid-cols-2 items-start gap-2 sm:gap-6">
                <div className="min-w-0">
                  <p className="mb-1 truncate text-center text-[10px] font-black uppercase tracking-wider text-emerald-300 sm:mb-2 sm:text-xs sm:tracking-widest">Ton véhicule</p>
                  <motion.div key={'player-' + cardIndex} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mx-auto w-full min-w-0 max-w-[clamp(118px,36vw,148px)] sm:max-w-[260px]">
                    <ScaledDuelCard vehicle={playerCards[cardIndex]} snapshot={match.player1Deck[cardIndex]}/>
                  </motion.div>
                </div>
                <div className="min-w-0">
                  <p className="mb-1 truncate text-center text-[10px] font-black uppercase tracking-wider text-rose-300 sm:mb-2 sm:text-xs sm:tracking-widest">Ordinateur</p>
                  <motion.div key={'opponent-' + cardIndex + '-' + String(revealed)}
                    initial={reducedMotion ? false : { opacity: 0.4, rotateY: revealed ? 75 : 0 }}
                    animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: 0.45 }}
                    className="mx-auto w-full min-w-0 max-w-[clamp(118px,36vw,148px)] sm:max-w-[260px]">
                    <ScaledDuelCard vehicle={opponentCards[cardIndex]} snapshot={match.player2Deck[cardIndex]} concealed={!revealed}/>
                  </motion.div>
                </div>
              </div>

              {revealed && lastRound ? (
                <div role="status" aria-live="polite" className="rounded-2xl border border-blue-300/20 bg-[#101827] p-4 text-center sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Statistique : {BATTLE_STATS[lastRound.stat].label}</p>
                  <div className="mt-3 grid grid-cols-3 items-center gap-2">
                    <p className="font-mono text-xl font-black tabular-nums text-emerald-200 sm:text-3xl">
                      {formatBattleStat(
                        lastRound.stat,
                        lastRound.player1Value,
                        units,
                        language,
                        Number(playerCards[lastRound.roundNumber - 1]?.power_kw) || undefined,
                      )}
                    </p>
                    <span className="text-xs text-gray-400">VS</span>
                    <p className="font-mono text-xl font-black tabular-nums text-rose-200 sm:text-3xl">
                      {formatBattleStat(
                        lastRound.stat,
                        lastRound.player2Value,
                        units,
                        language,
                        Number(opponentCards[lastRound.roundNumber - 1]?.power_kw) || undefined,
                      )}
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
                <div className="rounded-xl border border-white/10 bg-[#0d111a] p-3 sm:rounded-2xl sm:p-6">
                  {chooser === 'player1' ? (
                    <>
                      <h2 className="text-center text-sm font-black uppercase sm:text-lg">À toi de choisir la caractéristique</h2>
                      <p className="mt-1 text-center text-[10px] leading-tight text-gray-400 sm:text-xs sm:leading-normal">La meilleure valeur l’emporte. Masse et 0–100 : la plus petite valeur gagne.</p>
                      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-4 sm:grid-cols-3 sm:gap-2">
                        {BATTLE_STAT_KEYS.map((stat) => {
                          const used = match.rounds.filter((round) => round.selectedBy === 'player1' && round.stat === stat).length;
                          const enabled = nextStats.includes(stat);
                          return (
                            <button type="button" key={stat} disabled={!enabled} onClick={() => selectStat(stat)}
                              className="min-h-[66px] rounded-lg border border-blue-300/20 bg-blue-500/[0.08] p-2 text-left transition sm:min-h-20 sm:rounded-xl sm:p-3 hover:border-blue-300/70 hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.02] disabled:opacity-35">
                              <span className="block text-[10px] font-black uppercase leading-tight sm:text-xs sm:leading-normal">{BATTLE_STATS[stat].label}</span>
                              <span className="mt-0.5 block font-mono text-xs font-bold text-blue-200 sm:mt-1 sm:text-sm">
                                {formatBattleStat(
                                  stat,
                                  match.player1Deck[cardIndex].stats[stat],
                                  units,
                                  language,
                                  Number(playerCards[cardIndex]?.power_kw) || undefined,
                                )}
                              </span>
                              <span className="mt-0.5 block text-[9px] text-gray-400 sm:mt-1 sm:text-[10px]">{used}/2 utilisations</span>
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
