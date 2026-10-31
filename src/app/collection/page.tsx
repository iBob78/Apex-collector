'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import CardDetailsModal from '@/components/Collection/CardDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Rarity } from '@/types/game';
import { getNextLevelUnlock } from '@/lib/level';
import { purchaseCardUpgrade } from '@/lib/actions/card-upgrades';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import { Star } from 'lucide-react';

type FavoriteCategory = 'vehicle' | 'circuit';

function getCardId(card: any): string {
  return String(card.category === 'circuit' ? (card.id || card.circuit_id) : (card.card_id || card.id)).toLowerCase().trim();
}

function getFavoriteKey(card: any): string {
  const category: FavoriteCategory = card.category === 'circuit' ? 'circuit' : 'vehicle';
  return `${category}:${getCardId(card)}`;
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
  const [favoritePendingKey, setFavoritePendingKey] = useState<string | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'vehicle' | 'circuit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'make-asc' | 'make-desc' | 'ip-desc' | 'ip-asc' | 'level-asc' | 'level-desc' | 'rarity' | 'newest'>('name');

  // Keep the initial card grid light on smartphones when filters change.
  useEffect(() => setVisibleCount(24), [activeTab, searchQuery, rarityFilter, sortBy, favoritesOnly]);

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
      try {
        // 1. Récupérer toutes les bases (Véhicules ET Circuits)
        const [cardsRes, circuitsRes] = await Promise.all([
          supabase.from('cards').select('*').eq('is_active', true),
          supabase.from('circuits').select('*')
        ]);

        if (cardsRes.error) throw cardsRes.error;
        if (circuitsRes.error) throw circuitsRes.error;

        // Normalisation : On injecte la catégorie explicitement
        const allVehicles = (cardsRes.data || []).map(c => ({ ...c, category: 'vehicle' }));
        const allCircuits = (circuitsRes.data || []).map(c => ({ ...c, category: 'circuit' }));
        const combinedBase = [...allVehicles, ...allCircuits];

        // 2. Récupérer la collection (UserCards ET UserCircuits)
        if (!user) {
          setCards(combinedBase);
          setUserCardLevels({});
          setFavoriteKeys(new Set());
          setLoading(false);
          return;
        }

        const [userCardsRes, userCircuitsRes, favoritesRes] = await Promise.all([
          supabase.from('user_cards').select('*').eq('user_id', user.id),
          supabase.from('user_circuits').select('*').eq('user_id', user.id),
          supabase.from('card_favorites').select('category,card_id').eq('user_id', user.id),
        ]);

        if (userCardsRes.error) throw userCardsRes.error;
        if (userCircuitsRes.error) throw userCircuitsRes.error;

        if (favoritesRes.error) {
          console.error('[CollectionPage] Erreur favoris:', favoritesRes.error);
          setFavoritesError(t('Impossible de charger les favoris.'));
        } else {
          setFavoritesError(null);
          setFavoriteKeys(new Set((favoritesRes.data || []).map((item) => `${item.category}:${String(item.card_id).toLowerCase()}`)));
        }

        let ownedMap: Record<string, number> = {};
        let levelMap: Record<string, number> = {};

        // Mapping des véhicules
        userCardsRes.data?.forEach((item: any) => {
          const val = Number(item.count ?? item.quantity ?? 1);
          const rawCid = item.card_id || item.id;
          if (rawCid) {
            const cid = String(rawCid).toLowerCase().trim();
            ownedMap[cid] = (ownedMap[cid] || 0) + val;
            levelMap[cid] = Math.max(levelMap[cid] || 0, Number(item.upgrade_level) || 0);
          }
        });

        // Mapping des circuits
        userCircuitsRes.data?.forEach((item: any) => {
          const val = Number(item.count ?? 1);
          const cid = item.circuit_id || item.id; // Dans user_circuits, c'est souvent circuit_id
          if (cid) {
            const key = String(cid).toLowerCase().trim();
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

    if (favoritesOnly) {
      result = result.filter((card) => favoriteKeys.has(getFavoriteKey(card)));
    }

    // Recherche
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.make?.toLowerCase().includes(q)) ||
        (c.model?.toLowerCase().includes(q)) ||
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
        const cardIdA = String(a.card_id || a.id).toLowerCase().trim();
        const cardIdB = String(b.card_id || b.id).toLowerCase().trim();
        const levelDifference = (userCardLevels[cardIdA] || 0) - (userCardLevels[cardIdB] || 0);
        return sortBy === 'level-asc' ? levelDifference : -levelDifference;
      }
      // Par défaut: Nom (Make + Model)
      const nameA = `${a.make || ''} ${a.model || a.name || ''}`;
      const nameB = `${b.make || ''} ${b.model || b.name || ''}`;
      return nameA.localeCompare(nameB);
    });

    return result;
  }, [cards, activeTab, searchQuery, rarityFilter, sortBy, userCardLevels, favoritesOnly, favoriteKeys]);

  // Statistiques
  const stats = useMemo(() => {
    const total = cards.length;
    // Utilisation de userCards normalisée
    const activeVehicleIds = new Set(cards.filter((card) => card.category === 'vehicle').map((card) =>
      String(card.card_id || card.id).toLowerCase().trim(),
    ));
    const owned = Object.keys(userCards).filter((cardId) => activeVehicleIds.has(cardId)).length;
    const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
    const totalCopies = Object.entries(userCards)
      .filter(([cardId]) => activeVehicleIds.has(cardId) || cards.some((card) =>
        card.category === 'circuit' && String(card.circuit_id || card.id).toLowerCase().trim() === cardId,
      ))
      .reduce((totalCount, [, count]) => totalCount + count, 0);

    return { total, owned, percentage, totalCopies };
  }, [cards, userCards]);

  const handleToggleFavorite = async () => {
    if (!user || !selectedCard || favoritePendingKey) return;
    const category: FavoriteCategory = selectedCard.category === 'circuit' ? 'circuit' : 'vehicle';
    const cardId = getCardId(selectedCard);
    const key = getFavoriteKey(selectedCard);
    if ((userCards[cardId] || 0) <= 0) return;

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

  const handleUpgrade = async (card: any) => {
    if (!user || upgradingCardId) return;

    const cardId = String(card.card_id || card.id);
    const normalizedId = cardId.toLowerCase().trim();
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
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        <div className="p-4 md:p-8 flex-1">
          {/* Header & Stats */}
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-3xl font-black uppercase italic tracking-tighter text-transparent sm:text-4xl">
                  {t('Mon Garage')}
                </h1>
                <p className="text-gray-500 font-mono text-sm mt-1">
                  {t('Collection complète des véhicules et circuits d’exception.')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
                <StatCard label={t('Collection')} value={`${stats.owned}/${stats.total}`} sub={`${stats.percentage}%`} color="text-blue-400" />
                <StatCard label={t('Total Cartes')} value={stats.totalCopies} sub={t('Exemplaires')} color="text-purple-400" />
              </div>
            </div>

            {/* Barre de Filtres */}
            <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#0a0a0a] p-3 shadow-2xl sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-4">
              {/* Tabs */}
              <div className="grid w-full grid-cols-3 rounded-xl bg-white/5 p-1 sm:flex sm:w-auto">
                {(['all', 'vehicle', 'circuit'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`min-h-11 rounded-lg px-2 py-2 text-[11px] font-bold uppercase tracking-wide transition-all sm:px-4 sm:text-xs sm:tracking-widest ${activeTab === tab ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {t(tab === 'all' ? 'Tous' : tab === 'vehicle' ? 'Véhicules' : 'Circuits')}
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

              {/* Search */}
              <div className="w-full min-w-0 flex-1 sm:min-w-[200px]">
                <input
                  type="text"
                  placeholder={t('Rechercher une carte...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-base transition-colors focus:border-blue-500/50 focus:outline-none sm:text-sm"
                />
              </div>

              {/* Rarity Select */}
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value as any)}
                className="min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base text-white focus:outline-none sm:w-auto sm:text-sm [&>option]:bg-[#171717] [&>option]:text-white"
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
                className="min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base text-white focus:outline-none sm:w-auto sm:text-sm [&>option]:bg-[#171717] [&>option]:text-white"
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
          </header>

          {/* Grid of Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
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
                  {filteredCards.slice(0, visibleCount).map((card) => {
                    const cid = getCardId(card);
                    const c = userCards[cid] || 0;
                    const currentLevel = userCardLevels[cid] || 0;
                    const levelUnlock = getNextLevelUnlock(c, currentLevel);

                    return (
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
                          isFavorite={favoriteKeys.has(getFavoriteKey(card))}
                          owned={c > 0}
                          count={c}
                          upgradeLevel={currentLevel}
                          upgradeAvailable={Boolean(levelUnlock?.unlocked)}
                          upgradePrice={levelUnlock?.price}
                          upgradePending={upgradingCardId === cid}
                          onUpgrade={() => handleUpgrade(card)}
                          onCardClick={() => setSelectedCard(card)}
                        />
                      </motion.div>
                    );
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
                  className="min-h-12 rounded-xl border border-blue-400/40 bg-blue-500/15 px-6 py-3 text-sm font-bold text-blue-200 transition hover:bg-blue-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
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
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 sm:min-w-[120px] sm:px-6">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{label}</div>
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">{sub}</div>
    </div>
  );
}
