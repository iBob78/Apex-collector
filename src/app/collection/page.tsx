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
import { Star } from 'lucide-react';
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

  const handleToggleFavorite = async () => {
    if (!user || !selectedCard || favoritePendingKey) return;
    const category = getCardCategory(selectedCard);
    const cardId = getCardEntityId(selectedCard);
    const key = getFavoriteKey(selectedCard);
    if ((userCards[getCardId(selectedCard)] || 0) <= 0) return;

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

  return (
    <div className="apex-paddock flex min-h-screen text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        <div className="paddock-shell flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10">
          {/* Header & Stats */}
          <header className="mb-8">
            <div className="mb-5 grid gap-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(220px,.65fr)]">
              <div className="race-hero race-photo-soft min-h-[270px] sm:min-h-[315px]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#101215] via-[#101215]/90 to-transparent" aria-hidden="true" />
                <span className="absolute -right-6 -top-14 select-none font-['Barlow_Condensed'] text-[230px] font-black leading-none text-white/[.05]" aria-hidden="true">03</span>
                <div className="relative z-10 flex h-full flex-col justify-end px-5 py-8 sm:px-8 sm:py-10">
                  <p className="race-eyebrow">03 / THE COLLECTOR GRID</p>
                  <h1 className="paddock-title mt-5 max-w-2xl">{t('Mon Garage')}<span className="text-[#F0EFEB]">.</span></h1>
                  <p className="mt-5 max-w-[520px] border-l-[3px] border-[#D32F35] pl-4 text-sm leading-relaxed text-gray-300">
                    {t('Collection complète des véhicules, circuits et pilotes d’exception.')}
                  </p>
                  <div className="mt-6 flex items-center gap-3 font-mono text-[10px] font-bold tracking-[.13em] text-[#F0EFEB]">
                    <span>GARAGE // INVENTORY</span><span className="h-px w-12 bg-white/30"/><span>AC-003</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col border border-white/20 bg-[#232930]">
                <div className="bg-[#D32F35] px-4 py-3 font-['Barlow_Condensed'] text-[13px] font-black uppercase tracking-[.16em] text-[#F0EFEB]">GARAGE / COMPLETION</div>
                <div className="flex flex-1 flex-col justify-between gap-5 p-4 sm:p-6">
                  <div>
                    <p className="font-['Barlow_Condensed'] text-[74px] font-black leading-[.8] tabular-nums text-white sm:text-[92px]">{stats.percentage}<span className="text-[28px] text-[#F0EFEB]">%</span></p>
                    <p className="mt-4 font-['Barlow_Condensed'] text-[13px] font-bold uppercase tracking-[.12em] text-gray-400">{t('Collection')}</p>
                    <div className="paddock-meter mt-3"><div style={{ width: `${stats.percentage}%` }} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
                    <div>
                      <p className="font-['Barlow_Condensed'] text-[33px] font-black leading-none text-[#F0EFEB]">{stats.owned}<span className="text-[17px] text-gray-500">/{stats.total}</span></p>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-[.1em] text-gray-400">{t('Collection')}</span>
                    </div>
                    <div>
                      <p className="font-['Barlow_Condensed'] text-[33px] font-black leading-none text-white">{stats.totalCopies}</p>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-[.1em] text-gray-400">{t('Exemplaires')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de Filtres */}
            <div className="flex flex-col gap-3 border border-white/20 bg-[#232930] p-3 shadow-2xl sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-4">
              {/* Tabs */}
              <div className="grid w-full grid-cols-4 gap-[2px] bg-[#171A1E] p-1 sm:flex sm:w-auto">
                {(['all', 'vehicle', 'circuit', 'driver'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`min-h-11 rounded-lg px-1 py-2 text-[9px] font-bold uppercase tracking-wide transition-all sm:px-4 sm:text-xs sm:tracking-widest ${activeTab === tab ? 'bg-[#D32F35] text-[#171A1E]' : 'bg-[#101215] text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {t(tab === 'all' ? 'Tous' : tab === 'vehicle' ? 'Véhicules' : tab === 'circuit' ? 'Circuits' : 'Pilotes')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-pressed={favoritesOnly}
                onClick={() => setFavoritesOnly((current) => !current)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${favoritesOnly ? 'border-amber-400/70 bg-amber-400/20 text-amber-200' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'}`}
              >
                <Star size={18} fill={favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" />
                {t('Favoris')} ({favoriteKeys.size})
              </button>

              <label className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10 sm:w-auto">
                <input
                  type="checkbox"
                  checked={hideLockedCards}
                  onChange={(event) => setHideLockedCards(event.target.checked)}
                  className="size-4 accent-[#D32F35]"
                />
                <span>{t('Masquer les cartes non déverrouillées')}</span>
              </label>

              {/* Search */}
              <div className="w-full min-w-0 flex-1 sm:min-w-[200px]">
                <input
                  type="text"
                  placeholder={t('Rechercher une carte...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="paddock-field min-h-11 w-full rounded-xl px-4 py-2 text-base transition-colors sm:text-sm"
                />
              </div>

              {/* Rarity Select */}
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value as any)}
                className="paddock-field min-h-11 w-full min-w-0 px-3 py-2 text-base sm:w-auto sm:text-sm [&>option]:bg-[#101215] [&>option]:text-white"
              >
                <option value="All">{t('Toutes les raretés')}</option>
                <option value="Common">{t('Commun')}</option>
                <option value="Uncommon">{t('Inhabituel')}</option>
                <option value="Rare">{t('Rare')}</option>
                <option value="Epic">{t('Épique')}</option>
                <option value="Legend">{t('Légendaire')}</option>
                <option value="Icon">{t('Icon')}</option>
              </select>

              {/* Sort Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="paddock-field min-h-11 w-full min-w-0 px-3 py-2 text-base sm:w-auto sm:text-sm [&>option]:bg-[#101215] [&>option]:text-white"
              >
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
            {favoritesError && (
              <p role="alert" className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                {favoritesError}
              </p>
            )}
            {discoveryError && (
              <p role="alert" className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                {discoveryError}
              </p>
            )}
          </header>

          {/* Collection readout: only real filtered catalogue data. */}
          <div className="race-section-heading mb-5 flex-wrap justify-between gap-3">
            <div>
              <p className="race-eyebrow">GARAGE / GRID SCAN</p>
              <h2 className="paddock-section-title mt-2">{t('Collection')}</h2>
            </div>
            <div className="inline-flex items-center gap-2 border-l-[3px] border-[#D32F35] bg-[#232930] px-4 py-2 font-mono text-[12px] font-bold uppercase text-[#F0EFEB]">
              <span className="font-mono font-bold tabular-nums">{filteredCards.length}</span>
              <span className="font-bold uppercase tracking-[.1em]">{t('Cartes')}</span>
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
                  className="grid grid-cols-4 gap-x-1.5 gap-y-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),1fr))] sm:gap-x-6 sm:gap-y-8"
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
                  className="paddock-ghost min-h-12 rounded-xl px-6 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {t('Afficher plus')} ({Math.min(visibleCount, filteredCards.length)}/{filteredCards.length})
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </main>
      <CardDetailsModal
        card={selectedCard}
        ownedCount={selectedCard ? userCards[getCardId(selectedCard)] || 0 : 0}
        upgradeLevel={selectedCard ? userCardLevels[getCardId(selectedCard)] || 0 : 0}
        upgradePending={upgradingCardId === (selectedCard ? getCardId(selectedCard) : null)}
        isFavorite={selectedCard ? favoriteKeys.has(getFavoriteKey(selectedCard)) : false}
        favoritePending={selectedCard ? favoritePendingKey === getFavoriteKey(selectedCard) : false}
        onToggleFavorite={() => void handleToggleFavorite()}
        onUpgrade={() => selectedCard && handleUpgrade(selectedCard)}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string, value: string | number, sub: string, color: string }) {
  return (
    <div className="paddock-tile min-w-0 px-3 py-3 sm:min-w-[124px] sm:px-6">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{label}</div>
      <div className={`paddock-stat-number text-2xl sm:text-3xl ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">{sub}</div>
    </div>
  );
}
