'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllPages } from '@/lib/fetchAllPages';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import SafeImage from '@/components/SafeImage';
import CardDetailsModal from '@/components/Collection/CardDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Rarity } from '@/types/game';
import { getNextLevelUnlock } from '@/lib/level';
import { purchaseCardUpgrade } from '@/lib/actions/card-upgrades';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import { Star, Search, Layers3, LayoutGrid, SlidersHorizontal, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRarityColor } from '@/lib/rarity';
import { resolveBrandLogo } from '@/lib/images';

type FavoriteCategory = 'vehicle' | 'circuit' | 'driver';

function getCardCategory(card: any): FavoriteCategory {
  return card.category === 'circuit' || card.category === 'driver' ? card.category : 'vehicle';
}

function getCardEntityId(card: any): string {
  const category = getCardCategory(card);
  const id = category === 'circuit'
    ? card.circuit_id || card.id
    : category === 'driver'
      ? card.driver_id || card.id
      : card.card_id || card.id;
  return String(id).toLowerCase().trim();
}

function getCardId(card: any): string {
  return `${getCardCategory(card)}:${getCardEntityId(card)}`;
}

function getFavoriteKey(card: any): string {
  return `${getCardCategory(card)}:${getCardEntityId(card)}`;
}

export default function CollectionPage() {
  const { t } = useSitePreferences();
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [wideInspector, setWideInspector] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1536px)');
    const sync = () => setWideInspector(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const [userCards, setUserCards] = useState<Record<string, number>>({});
  const [userCardLevels, setUserCardLevels] = useState<Record<string, number>>({});
  const [upgradingCardId, setUpgradingCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(24);
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(() => new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [hideLockedCards, setHideLockedCards] = useState(false);
  const [favoritePendingKey, setFavoritePendingKey] = useState<string | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [newCardKeys, setNewCardKeys] = useState<Set<string>>(() => new Set());
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'vehicle' | 'circuit' | 'driver'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'make-asc' | 'make-desc' | 'ip-desc' | 'ip-asc' | 'level-asc' | 'level-desc' | 'rarity' | 'newest'>('name');

  // Keep the initial card grid light on smartphones when filters change.
  useEffect(() => setVisibleCount(24), [activeTab, searchQuery, rarityFilter, sortBy, favoritesOnly, hideLockedCards]);

  // Authentification
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDiscoveryError(null);
      try {
        // 1. Récupérer tous les catalogues disponibles.
        const [vehicleRows, circuitRows, driverRows] = await Promise.all([
          fetchAllPages((from, to) => supabase.from('cards')
            .select('*').eq('is_active', true).order('id').range(from, to)),
          fetchAllPages((from, to) => supabase.from('circuits')
            .select('*').order('id').range(from, to)),
          fetchAllPages((from, to) => supabase.from('drivers')
            .select('*').eq('is_active', true).order('id').range(from, to)),
        ]);

        // Normalisation : On injecte la catégorie explicitement
        const allVehicles = vehicleRows.map(c => ({ ...c, category: 'vehicle' }));
        const allCircuits = circuitRows.map(c => ({ ...c, category: 'circuit' }));
        const allDrivers = driverRows.map(c => ({ ...c, category: 'driver' }));
        const combinedBase = [...allVehicles, ...allCircuits, ...allDrivers];

        // 2. Récupérer les cartes possédées et les favoris du joueur.
        if (!user) {
          setCards(combinedBase);
          setUserCardLevels({});
          setFavoriteKeys(new Set());
          setNewCardKeys(new Set());
          setLoading(false);
          return;
        }

        const [ownedVehicles, ownedCircuits, ownedDrivers, favorites, discoveries] = await Promise.all([
          fetchAllPages((from, to) => supabase.from('user_cards')
            .select('*').eq('user_id', user.id).order('id').range(from, to)),
          fetchAllPages((from, to) => supabase.from('user_circuits')
            .select('*').eq('user_id', user.id).order('id').range(from, to)),
          fetchAllPages((from, to) => supabase.from('user_drivers')
            .select('*').eq('user_id', user.id).order('id').range(from, to)),
          fetchAllPages((from, to) => supabase.from('card_favorites')
            .select('category,card_id').eq('user_id', user.id)
            .order('category').order('card_id').range(from, to))
            .catch((error) => {
              // Les favoris restent optionnels : un échec ne masque pas le catalogue.
              console.error('[CollectionPage] Erreur favoris:', error);
              setFavoritesError(t('Impossible de charger les favoris.'));
              return null;
            }),
          fetchAllPages((from, to) => supabase.from('user_card_discoveries')
            .select('category,card_id,seen_at').eq('user_id', user.id)
            .order('category').order('card_id').range(from, to))
            .catch((error) => {
              console.error('[CollectionPage] Erreur nouvelles cartes:', error);
              setDiscoveryError(t('Impossible de charger les nouvelles cartes.'));
              return null;
            }),
        ]);

        if (favorites !== null) {
          setFavoritesError(null);
          setFavoriteKeys(new Set(favorites.map((item) => `${item.category}:${String(item.card_id).toLowerCase()}`)));
        }
        if (discoveries !== null) {
          setNewCardKeys(new Set(
            discoveries
              .filter((item) => !item.seen_at)
              .map((item) => `${item.category}:${String(item.card_id).toLowerCase()}`),
          ));
        }

        let ownedMap: Record<string, number> = {};
        let levelMap: Record<string, number> = {};

        // Mapping des véhicules
        ownedVehicles.forEach((item: any) => {
          const val = Number(item.count ?? item.quantity ?? 1);
          const rawCid = item.card_id || item.id;
          if (rawCid) {
            const cid = `vehicle:${String(rawCid).toLowerCase().trim()}`;
            ownedMap[cid] = (ownedMap[cid] || 0) + val;
            levelMap[cid] = Math.max(levelMap[cid] || 0, Number(item.upgrade_level) || 0);
          }
        });

        // Mapping des circuits
        ownedCircuits.forEach((item: any) => {
          const val = Number(item.count ?? 1);
          const cid = item.circuit_id || item.id; // Dans user_circuits, c'est souvent circuit_id
          if (cid) {
            const key = `circuit:${String(cid).toLowerCase().trim()}`;
            ownedMap[key] = (ownedMap[key] || 0) + val;
          }
        });

        ownedDrivers.forEach((item: any) => {
          const val = Number(item.count ?? 1);
          const driverId = item.driver_id || item.id;
          if (driverId) {
            const key = `driver:${String(driverId).toLowerCase().trim()}`;
            ownedMap[key] = (ownedMap[key] || 0) + val;
          }
        });

        setCards(combinedBase);
        setUserCards(ownedMap);
        setUserCardLevels(levelMap);
      } catch (err) {
        console.error('Erreur lors du chargement de la collection:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, t]);

  // Logique de filtrage et tri
  const filteredCards = useMemo(() => {
    let result = [...cards];

    // Onglets (Catégorie)
    if (activeTab !== 'all') {
      result = result.filter(c => (c.category || 'vehicle') === activeTab);
    }

    if (hideLockedCards) {
      result = result.filter((card) => (userCards[getCardId(card)] || 0) > 0);
    }

    if (favoritesOnly) {
      result = result.filter((card) => favoriteKeys.has(getFavoriteKey(card)));
    }

    // Recherche
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.make?.toLowerCase().includes(q)) ||
        (c.model?.toLowerCase().includes(q)) ||
        (c.country?.toLowerCase().includes(q)) ||
        (c.name?.toLowerCase().includes(q))
      );
    }

    // Rareté
    if (rarityFilter !== 'All') {
      result = result.filter(c => c.rarity === rarityFilter);
    }

    // Tri
    result.sort((a, b) => {
      if (sortBy === 'rarity') {
        const order: Record<string, number> = { 'Legend': 4, 'Epic': 3, 'Rare': 2, 'Common': 1 };
        return (order[b.rarity] || 0) - (order[a.rarity] || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'make-asc' || sortBy === 'make-desc') {
        const isVehicleA = getCardCategory(a) === 'vehicle';
        const isVehicleB = getCardCategory(b) === 'vehicle';
        if (isVehicleA !== isVehicleB) return isVehicleA ? -1 : 1;
        const makeA = a.make || a.manufacturer || a.name || '';
        const makeB = b.make || b.manufacturer || b.name || '';
        const direction = sortBy === 'make-asc' ? 1 : -1;
        return direction * makeA.localeCompare(makeB, undefined, { sensitivity: 'base' });
      }
      if (sortBy === 'ip-desc' || sortBy === 'ip-asc') {
        const getIp = (card: any) => {
          const power = Number(card.power_hp) || 0;
          const rawWeight = Number(card.weight_t) || 0;
          const weightKg = rawWeight > 50 ? rawWeight : rawWeight * 1000;
          return power > 0 && weightKg > 0 ? Math.floor((power / weightKg) * 1000) : 0;
        };
        const direction = sortBy === 'ip-desc' ? -1 : 1;
        return direction * (getIp(a) - getIp(b));
      }
      if (sortBy === 'level-asc' || sortBy === 'level-desc') {
        const cardIdA = getCardId(a);
        const cardIdB = getCardId(b);
        const levelDifference = (userCardLevels[cardIdA] || 0) - (userCardLevels[cardIdB] || 0);
        return sortBy === 'level-asc' ? levelDifference : -levelDifference;
      }
      // Par défaut: Nom (Make + Model)
      const nameA = `${a.make || ''} ${a.model || a.name || ''}`;
      const nameB = `${b.make || ''} ${b.model || b.name || ''}`;
      return nameA.localeCompare(nameB);
    });

    return result;
  }, [cards, activeTab, searchQuery, rarityFilter, sortBy, userCardLevels, userCards, hideLockedCards, favoritesOnly, favoriteKeys]);

  // Statistiques
  const stats = useMemo(() => {
    const total = cards.length;
    // Utilisation de userCards normalisée
    const activeCardIds = new Set(cards.map(getCardId));
    const owned = Object.keys(userCards).filter((cardId) => activeCardIds.has(cardId)).length;
    const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
    const totalCopies = Object.entries(userCards)
      .filter(([cardId]) => activeCardIds.has(cardId))
      .reduce((totalCount, [, count]) => totalCount + count, 0);

    return { total, owned, percentage, totalCopies };
  }, [cards, userCards]);

  const handleToggleFavorite = async (cardOverride?: any) => {
    const target = cardOverride || selectedCard;
    if (!user || !target || favoritePendingKey) return;
    const category = getCardCategory(target);
    const cardId = getCardEntityId(target);
    const key = getFavoriteKey(target);
    if ((userCards[getCardId(target)] || 0) <= 0) return;

    setFavoritePendingKey(key);
    setFavoritesError(null);

    try {
      const isFavorite = favoriteKeys.has(key);
      const query = isFavorite
        ? supabase.from('card_favorites').delete().eq('user_id', user.id).eq('category', category).eq('card_id', cardId)
        : supabase.from('card_favorites').insert({ user_id: user.id, category, card_id: cardId });
      const { error } = await query;
      if (error) throw error;

      setFavoriteKeys((previous) => {
        const updated = new Set(previous);
        if (isFavorite) updated.delete(key);
        else updated.add(key);
        return updated;
      });
    } catch (error) {
      console.error('[CollectionPage] Enregistrement favori impossible:', error);
      setFavoritesError(t('Impossible d’enregistrer ce favori. Réessayez.'));
    } finally {
      setFavoritePendingKey(null);
    }
  };

  const handleOpenCardDetails = async (card: any) => {
    setSelectedCard(card);
    if (!wideInspector) setDetailModalOpen(true);
    const key = getFavoriteKey(card);
    if (!user || !newCardKeys.has(key)) return;

    setDiscoveryError(null);
    try {
      const { error } = await supabase
        .from('user_card_discoveries')
        .update({ seen_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('category', getCardCategory(card))
        .eq('card_id', getCardEntityId(card))
        .is('seen_at', null);
      if (error) throw error;

      setNewCardKeys((current) => {
        const updated = new Set(current);
        updated.delete(key);
        return updated;
      });
    } catch (error) {
      console.error('[CollectionPage] Impossible de marquer la découverte comme vue:', error);
      setDiscoveryError(t('Impossible d’enregistrer la découverte. Réessayez.'));
    }
  };

  const handleUpgrade = async (card: any) => {
    if (!user || upgradingCardId) return;

    const cardId = String(card.card_id || card.id);
    const normalizedId = getCardId(card);
    const currentLevel = userCardLevels[normalizedId] || 0;
    const unlock = getNextLevelUnlock(userCards[normalizedId] || 0, currentLevel);
    if (!unlock?.unlocked) return;

    const confirmed = window.confirm(
      t('Acheter le niveau {level} pour {price} AP ?', {
        level: unlock.nextLevel,
        price: unlock.price,
      }),
    );
    if (!confirmed) return;

    setUpgradingCardId(normalizedId);
    try {
      const result = await purchaseCardUpgrade(cardId);
      if (!result.success) {
        window.alert(`${t('Erreur')}: ${result.error}`);
        return;
      }

      setUserCardLevels((current) => ({ ...current, [normalizedId]: result.level }));
      window.alert(t('Niveau {level} acheté. Solde restant : {balance} AP.', {
        level: result.level,
        balance: result.balance,
      }));
    } catch (error) {
      console.error('[CollectionPage] Erreur lors de l’achat du niveau:', error);
      window.alert(t('Une erreur est survenue pendant l’achat du niveau.'));
    } finally {
      setUpgradingCardId(null);
    }
  };


  // The preview must never disclose a locked card, including keyboard navigation.
  const inspectableCards = filteredCards.filter((item) => (userCards[getCardId(item)] || 0) > 0);
  const inspectorCard = (selectedCard && inspectableCards.some((item) => getCardId(item) === getCardId(selectedCard))
    ? selectedCard
    : null) || inspectableCards[0] || null;
  const inspectorIndex = inspectorCard ? inspectableCards.findIndex((item) => getCardId(item) === getCardId(inspectorCard)) : -1;

  return (
    <div className="apex-paddock flex min-h-screen text-white">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="paddock-shell space-y-4 px-3 py-4 pb-28 sm:px-5 sm:py-6 lg:px-6 2xl:px-7">
          <header className="collector-hero flex flex-col justify-end p-5 sm:min-h-[245px] sm:p-8">
            <div className="relative z-10 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="paddock-eyebrow">{t('Collection')}</p>
                <h1 className="mt-3 font-['Barlow_Condensed'] text-[clamp(2.6rem,5vw,4.9rem)] font-black italic leading-[.85] tracking-[-.025em] text-white drop-shadow-xl">
                  {t('Ma Collection')}
                </h1>
                <p className="mt-3 text-sm text-[#dce5f6]">{t('Collection complète des véhicules, circuits et pilotes d’exception.')}</p>
                <div className="mt-4 max-w-[360px]">
                  <p className="mb-2 text-[12px] font-bold tabular-nums text-white">{stats.owned.toLocaleString()} / {stats.total.toLocaleString()} {t('Cartes')} ({stats.percentage} %)</p>
                  <div className="paddock-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.percentage} aria-label={t('Collection')}>
                    <div style={{width: `${stats.percentage}%`}} />
                  </div>
                </div>
              </div>
              <div className="apx-hud hidden items-center gap-4 px-4 py-3 sm:flex">
                <Layers3 size={23} className="text-[#7abaff]" aria-hidden="true" />
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-[#9eafd1]">{t('Exemplaires')}</span>
                  <span className="font-mono text-xl font-bold tabular-nums">{stats.totalCopies.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid min-w-0 items-start gap-3 xl:grid-cols-[190px_minmax(0,1fr)] 2xl:grid-cols-[194px_minmax(0,1fr)_252px]">
            <aside className="collector-rail" aria-label={t('Filtres')}>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white"><SlidersHorizontal size={17} className="text-[#91b5ff]" aria-hidden="true" /> {t('Filtres')}</h2>
              <div className="collector-divider" />
              <label className="relative block">
                <span className="sr-only">{t('Rechercher une carte...')}</span>
                <Search size={17} className="pointer-events-none absolute left-3 top-3.5 text-[#8193b8]" aria-hidden="true"/>
                <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Rechercher une carte...')}
                  className="paddock-field min-h-11 w-full pl-9 pr-3 text-[12px]" />
              </label>
              <div className="collector-divider" />
              <p className="collector-rail-heading mb-3">{t('Collection')}</p>
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
                {(['all', 'vehicle', 'circuit', 'driver'] as const).map((tab) => (
                  <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)}
                    className={`min-h-9 rounded-lg px-3 py-2 text-left text-[12px] font-semibold transition ${activeTab === tab ? 'border border-[#7085ff]/70 bg-[#31447d] text-white' : 'border border-white/10 bg-[#0c1629] text-[#b6c1d7] hover:bg-[#24345a] hover:text-white'}`}>
                    {t(tab === 'all' ? 'Tous' : tab === 'vehicle' ? 'Véhicules' : tab === 'circuit' ? 'Circuits' : 'Pilotes')}
                  </button>
                ))}
              </div>
              <div className="collector-divider" />
              <label className="mb-2 block collector-rail-heading">{t('Toutes les raretés')}</label>
              <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value as Rarity | 'All')} className="paddock-field min-h-11 w-full px-3 text-[12px]">
                <option value="All">{t('Toutes les raretés')}</option>
                <option value="Common">{t('Commun')}</option>
                <option value="Uncommon">{t('Inhabituel')}</option>
                <option value="Rare">{t('Rare')}</option>
                <option value="Epic">{t('Épique')}</option>
                <option value="Legend">{t('Légendaire')}</option>
                <option value="Icon">{t('Icon')}</option>
              </select>
              <div className="collector-divider" />
              <label className="flex min-h-10 items-center gap-2 text-[12px] text-[#c4cde3]">
                <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="h-4 w-4 accent-[#8274f7]" />
                <Star size={15} className="text-[#cda2ff]" aria-hidden="true" /> {t('Favoris')} ({favoriteKeys.size})
              </label>
              <label className="mt-2 flex min-h-10 items-center gap-2 text-[12px] text-[#c4cde3]">
                <input type="checkbox" checked={hideLockedCards} onChange={(e) => setHideLockedCards(e.target.checked)} className="h-4 w-4 accent-[#8274f7]" />
                <span>{t('Masquer les cartes non déverrouillées')}</span>
              </label>
              <div className="collector-divider" />
              <button type="button" onClick={() => {setActiveTab('all');setRarityFilter('All');setFavoritesOnly(false);setHideLockedCards(false);setSearchQuery('');setSortBy('name');}}
                className="paddock-ghost min-h-10 w-full px-3 text-[11px] font-semibold">
                {t('Réinitialiser les filtres')}
              </button>
              {(favoritesError || discoveryError) && (
                <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-900/20 p-3 text-xs text-red-200">{favoritesError || discoveryError}</p>
              )}
            </aside>

            <section className="collector-gallery" aria-label={t('Ma Collection')}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={18} className="text-[#9cafff]" aria-hidden="true"/>
                  <span className="text-lg font-bold tabular-nums">{filteredCards.length.toLocaleString()}</span>
                  <span className="text-sm text-[#aab7d1]">{t('Cartes')}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="hidden text-[11px] text-[#a3aec8] sm:block">{t('Trier par')}</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="paddock-field min-h-10 min-w-0 max-w-[220px] px-2 text-[11px]">
                    <option value="name">{t('Trier par Nom')}</option>
                    <option value="make-asc">{t('Marques, A à Z')}</option>
                    <option value="make-desc">{t('Marques, Z à A')}</option>
                    <option value="ip-desc">{t('IP, décroissant')}</option>
                    <option value="ip-asc">{t('IP, croissant')}</option>
                    <option value="level-asc">{t('Niveau, croissant')}</option>
                    <option value="level-desc">{t('Niveau, décroissant')}</option>
                    <option value="rarity">{t('Trier par Rareté')}</option>
                    <option value="newest">{t('Plus récent')}</option>
                  </select>
                </div>
              </div>
          {/* Grid of Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="w-12 h-12 border-4 border-[#555D65] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-mono text-sm uppercase tracking-widest">{t('Initialisation du garage...')}</p>
            </div>
          ) : (
            <>
            <AnimatePresence mode="popLayout">
              {filteredCards.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-4 gap-x-1.5 gap-y-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,10.5rem),1fr))] sm:gap-x-3 sm:gap-y-5 2xl:grid-cols-4"
                >
                  {filteredCards.slice(0, visibleCount).flatMap((card, index, visibleCards) => {
                    const cid = getCardId(card);
                    const c = userCards[cid] || 0;
                    const currentLevel = userCardLevels[cid] || 0;
                    const levelUnlock = getNextLevelUnlock(c, currentLevel);
                    const make = getCardCategory(card) === 'vehicle'
                      ? String(card.make || card.manufacturer || '').trim()
                      : '';
                    const previousCard = visibleCards[index - 1];
                    const previousMake = previousCard && getCardCategory(previousCard) === 'vehicle'
                      ? String(previousCard.make || previousCard.manufacturer || '').trim()
                      : '';
                    const startsMakeGroup = (sortBy === 'make-asc' || sortBy === 'make-desc')
                      && make
                      && make.toLocaleLowerCase() !== previousMake.toLocaleLowerCase();
                    const cardElement = (
                      <motion.div
                        key={cid}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`collector-card-wrap ${inspectorCard && getCardId(inspectorCard) === cid ? 'collector-card-selected' : ''}`}
                      >
                        <Card
                          {...card}
                          mobileGrid
                          pointerTilt
                          hideUnownedContent
                          newlyAcquired={newCardKeys.has(getFavoriteKey(card))}
                          isFavorite={favoriteKeys.has(getFavoriteKey(card))}
                          owned={c > 0}
                          count={c}
                          upgradeLevel={currentLevel}
                          upgradeAvailable={Boolean(levelUnlock?.unlocked)}
                          upgradePrice={levelUnlock?.price}
                          upgradePending={upgradingCardId === cid}
                          onUpgrade={() => handleUpgrade(card)}
                          onCardClick={() => void handleOpenCardDetails(card)}
                        />
                      </motion.div>
                    );

                    if (!startsMakeGroup) return [cardElement];

                    const logo = resolveBrandLogo(make);
                    return [
                      <motion.div
                        key={`brand-${make.toLocaleLowerCase()}`}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="col-span-full flex min-w-0 items-center gap-3 border-t border-[#555D65]/10 pt-3 first:border-0 first:pt-0 sm:gap-4 sm:pt-5"
                      >
                        <div className="paddock-tile relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12">
                          <span aria-hidden="true" className="text-sm font-black text-white/60 sm:text-base">
                            {make.slice(0, 2).toUpperCase()}
                          </span>
                          {logo && (
                            <SafeImage
                              src={logo}
                              alt=""
                              fill
                              showPlaceholderOnError={false}
                              className="object-contain p-1.5"
                            />
                          )}
                        </div>
                        <h2 className="shrink-0 text-base font-normal uppercase tracking-[0.09em] text-[#F0EFEB] sm:text-xl" style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>
                          {make}
                        </h2>
                        <div aria-hidden="true" className="h-px min-w-0 flex-1 bg-gradient-to-r from-[#D32F35]/50 via-white/15 to-transparent" />
                      </motion.div>,
                      cardElement,
                    ];
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-gray-500 font-mono italic">{t('Aucune carte trouvée pour ces critères.')}</p>
                </div>
              )}
            </AnimatePresence>
            {visibleCount < filteredCards.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + 24)}
                  className="paddock-ghost min-h-12 rounded-xl px-6 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F35]"
                >
                  {t('Afficher plus')} ({Math.min(visibleCount, filteredCards.length)}/{filteredCards.length})
                </button>
              </div>
            )}
            </>
          )}
            </section>

            <aside className="collector-inspector hidden 2xl:block" aria-label={t('Détails de la carte')}>
              {inspectorCard ? (
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="collector-rail-heading">{t('Détails de la carte')}</span>
                    <span className="rounded-md border border-white/20 bg-[#19243d] px-2 py-1 font-mono text-xs">
                      {inspectorCard.collection_number ? `#${inspectorCard.collection_number}` : ''}
                    </span>
                  </div>
                  <div className="collector-inspector-card">
                    <Card {...inspectorCard} owned={true} compact showLevel={false}
                      onCardClick={() => {setSelectedCard(inspectorCard);setDetailModalOpen(true);}}/>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-2">
                    <h3 className="min-w-0 text-lg font-black leading-tight text-white">{getCardCategory(inspectorCard) === 'vehicle' ? `${inspectorCard.make || ''} ${inspectorCard.model || ''}`.trim() : inspectorCard.name || ''}</h3>
                    <span className="shrink-0 rounded-lg border px-2 py-1 text-xs font-bold" style={{color:getRarityColor(String(inspectorCard.rarity || 'Common')),borderColor:getRarityColor(String(inspectorCard.rarity || 'Common'))}}>
                      {t(String(inspectorCard.rarity || 'Common'))}
                    </span>
                  </div>
                  <div className="collector-divider" />
                  <dl className="space-y-3 text-[12px]">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[#97a5c2]">{t('Collection')}</dt>
                      <dd className="max-w-[130px] text-right font-semibold">{inspectorCard.collection_name || inspectorCard.collection || '—'}</dd>
                    </div>
                    {getCardCategory(inspectorCard) === 'vehicle' && (
                      <>
                        <div className="flex justify-between gap-3"><dt className="text-[#97a5c2]">{t('Marque')}</dt><dd className="font-semibold">{inspectorCard.make || '—'}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-[#97a5c2]">{t('Année')}</dt><dd className="font-semibold">{inspectorCard.year || '—'}</dd></div>
                      </>
                    )}
                    <div className="flex justify-between gap-3"><dt className="text-[#97a5c2]">{t('Exemplaires')}</dt><dd className="font-bold text-[#99deff]">{userCards[getCardId(inspectorCard)] || 0}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-[#97a5c2]">{t('Niveau')}</dt><dd className="font-semibold">{userCardLevels[getCardId(inspectorCard)] || 0}</dd></div>
                  </dl>
                  <div className="collector-divider" />
                  <div className="flex gap-2">
                    <button type="button" disabled={Boolean(favoritePendingKey)}
                      onClick={() => void handleToggleFavorite(inspectorCard)}
                      aria-label={t('Favoris')}
                      className="paddock-ghost inline-flex h-11 w-11 shrink-0 items-center justify-center disabled:opacity-50">
                      <Star size={18} fill={favoriteKeys.has(getFavoriteKey(inspectorCard)) ? 'currentColor' : 'none'}
                        className={favoriteKeys.has(getFavoriteKey(inspectorCard)) ? 'text-[#f0c66b]' : 'text-white'} aria-hidden="true"/>
                    </button>
                    <button type="button" onClick={() => {setSelectedCard(inspectorCard);setDetailModalOpen(true);}}
                      className="paddock-action min-h-11 flex-1 px-2 text-[12px]">{t('Voir les détails')} <ArrowUpRight size={16} aria-hidden="true"/></button>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <button type="button" aria-label={t('Carte précédente')} disabled={inspectorIndex <= 0}
                      onClick={() => inspectorIndex > 0 && void handleOpenCardDetails(inspectableCards[inspectorIndex - 1])}
                      className="paddock-ghost flex h-9 w-10 items-center justify-center disabled:opacity-30"><ChevronLeft size={17}/></button>
                    <span className="font-mono text-[11px] text-[#9aa9c7]">{inspectorIndex + 1} / {inspectableCards.length}</span>
                    <button type="button" aria-label={t('Carte suivante')} disabled={inspectorIndex < 0 || inspectorIndex >= inspectableCards.length - 1}
                      onClick={() => inspectorIndex >= 0 && inspectorIndex < inspectableCards.length - 1 && void handleOpenCardDetails(inspectableCards[inspectorIndex + 1])}
                      className="paddock-ghost flex h-9 w-10 items-center justify-center disabled:opacity-30"><ChevronRight size={17}/></button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-[#a8b5d0]">{t('Sélectionnez une carte de votre collection.')}</div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <CardDetailsModal
        card={detailModalOpen ? selectedCard : null}
        ownedCount={selectedCard ? userCards[getCardId(selectedCard)] || 0 : 0}
        upgradeLevel={selectedCard ? userCardLevels[getCardId(selectedCard)] || 0 : 0}
        upgradePending={upgradingCardId === (selectedCard ? getCardId(selectedCard) : null)}
        isFavorite={selectedCard ? favoriteKeys.has(getFavoriteKey(selectedCard)) : false}
        favoritePending={selectedCard ? favoritePendingKey === getFavoriteKey(selectedCard) : false}
        onToggleFavorite={() => void handleToggleFavorite()}
        onUpgrade={() => selectedCard && handleUpgrade(selectedCard)}
        onClose={() => setDetailModalOpen(false)}
      />
    </div>
  );
}
