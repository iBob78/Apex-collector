'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllPages } from '@/lib/fetchAllPages';
import type { CardCategory, Rarity } from '@/types/game';
import { buildSellInventory, filterSellInventory } from '@/lib/marketSellInventory';
import type { SellCategory, SellSort, SellInventoryItem } from '@/lib/marketSellInventory';
import { getMarketplaceListings, getMyMarketplaceListings, buyListing, createListing, cancelListing } from '@/lib/actions/marketplace';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, FilterIcon, TagIcon, CoinsIcon, Loader2Icon, XIcon, PlusIcon, StarIcon } from 'lucide-react';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function MarketplacePage() {
  const { t } = useSitePreferences();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userCards, setUserCards] = useState<SellInventoryItem[]>([]);
  const [sellInventoryLoading, setSellInventoryLoading] = useState(false);
  const [sellInventoryError, setSellInventoryError] = useState<string | null>(null);
  const [sellCategory, setSellCategory] = useState<SellCategory>('all');
  const [sellSearchQuery, setSellSearchQuery] = useState('');
  const [sellRarity, setSellRarity] = useState<Rarity | 'All'>('All');
  const [sellSort, setSellSort] = useState<SellSort>('name');
  const [sellFavoritesOnly, setSellFavoritesOnly] = useState(false);
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(() => new Set());
  const [creatingListing, setCreatingListing] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'my_listings'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(prof);
      }
    };
    fetchSession();
  }, []);

  const loadSellInventory = async (userId: string) => {
    setSellInventoryLoading(true);
    setSellInventoryError(null);
    try {
      // All three inventories are paginated, just like the collection.
      const [vehicles, circuits, drivers, favorites, myListings] = await Promise.all([
        fetchAllPages((from, to) => supabase.from('user_cards')
          .select('*, card:cards!inner(*)').eq('user_id', userId).order('id').range(from, to)),
        fetchAllPages((from, to) => supabase.from('user_circuits')
          .select('*, card:circuits!inner(*)').eq('user_id', userId).order('id').range(from, to)),
        fetchAllPages((from, to) => supabase.from('user_drivers')
          .select('*, card:drivers!inner(*)').eq('user_id', userId).order('id').range(from, to)),
        fetchAllPages((from, to) => supabase.from('card_favorites')
          .select('category,card_id').eq('user_id', userId)
          .order('category').order('card_id').range(from, to))
          .catch(() => null),
        getMyMarketplaceListings(userId),
      ]);
      if (favorites) {
        setFavoriteKeys(new Set(favorites.map((item) =>
          `${item.category}:${String(item.card_id).toLowerCase()}`)));
      } else {
        setFavoriteKeys(new Set());
      }
      if (myListings.error) throw new Error(myListings.error);

      setUserCards(buildSellInventory(vehicles, circuits, drivers, myListings.data));
    } catch (error) {
      setSellInventoryError(error instanceof Error ? error.message : 'Impossible de charger les cartes.');
      setUserCards([]);
    } finally {
      setSellInventoryLoading(false);
    }
  };

  const filteredSellCards = useMemo(() => filterSellInventory(userCards, {
    category: sellCategory,
    search: sellSearchQuery,
    rarity: sellRarity,
    sort: sellSort,
    favoritesOnly: sellFavoritesOnly,
  }, favoriteKeys), [
    userCards, sellCategory, sellSearchQuery, sellRarity, sellSort, sellFavoritesOnly, favoriteKeys,
  ]);

  const openSellModal = () => {
    setIsSellModalOpen(true);
    if (user) void loadSellInventory(user.id);
  };

  const refreshListings = async () => {
    setLoading(true);
    const { data, error } = activeTab === 'my_listings' && user
      ? await getMyMarketplaceListings(user.id)
      : await getMarketplaceListings();
    setListings(data ?? []);
    setMarketError(error);
    setLoading(false);
  };

  useEffect(() => {
    void refreshListings();
  }, [activeTab, user?.id]);

  const handleBuy = async (listingId: string, price: number) => {
    if (!user) return alert(t('Veuillez vous connecter pour acheter.'));
    if (profile && profile.ap < price) return alert(t('Solde AC insuffisant.'));

    if (!confirm(t('Voulez-vous acheter cette carte pour {price} AC ?', { price }))) return;

    setProcessingId(listingId);
    const result = await buyListing(user.id, listingId);

    if (result.success) {
      alert(t('Achat réussi ! La carte a été ajoutée à votre garage.'));
      refreshListings();
      // The database returns the authoritative balance after an atomic trade.
      if (typeof result.balance === 'number' && Number.isFinite(result.balance)) {
        setProfile((current: any) => current ? { ...current, ap: result.balance } : current);
      }
    } else {
      alert(`${t('Erreur')}: ${result.error}`);
    }
    setProcessingId(null);
  };

  const handleCancel = async (listingId: string) => {
    if (!confirm(t('Annuler cette annonce ?'))) return;
    setProcessingId(listingId);
    const result = await cancelListing(listingId);
    if (result.success) {
      await refreshListings();
    } else {
      alert(`${t('Erreur')}: ${result.error}`);
    }
    setProcessingId(null);
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 flex flex-col">
        <div className="p-4 md:p-8 flex-1">
          {/* Header */}
          <header className="mb-10">
            <h1 className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-3xl font-black uppercase italic tracking-tighter text-transparent sm:text-4xl">
              Marketplace
            </h1>
            <p className="text-gray-500 font-mono text-sm mt-1">
              {t('Échangez et achetez des pièces rares pour votre écurie.')}
            </p>

            {/* Navigation Tabs */}
            <div className="flex gap-8 mt-8 border-b border-white/5">
              <button
                onClick={() => setActiveTab('browse')}
                className={`pb-4 px-2 text-sm font-black tracking-widest uppercase transition-all relative ${activeTab === 'browse' ? 'text-blue-500' : 'text-gray-500 hover:text-white'
                  }`}
              >
                {t('Parcourir')}
                {activeTab === 'browse' && <motion.div layoutId="mkt_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />}
              </button>
              <button
                onClick={() => setActiveTab('my_listings')}
                className={`pb-4 px-2 text-sm font-black tracking-widest uppercase transition-all relative ${activeTab === 'my_listings' ? 'text-blue-500' : 'text-gray-500 hover:text-white'
                  }`}
              >
                {t('Mes Ventes')}
                {activeTab === 'my_listings' && <motion.div layoutId="mkt_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />}
              </button>
            </div>
          </header>

          {/* Filters Bar */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center gap-4 mb-8">
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[240px]">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder={t('Rechercher une rareté, une marque...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-base transition-colors focus:border-blue-500/50 focus:outline-none sm:text-sm"
              />
            </div>

            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3 transition-all">
              <FilterIcon size={18} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest">{t('Filtres')}</span>
            </button>

            <button
              onClick={openSellModal}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl flex items-center gap-3 transition-all shadow-lg shadow-blue-500/20"
            >
              <TagIcon size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{t('Vendre une carte')}</span>
            </button>
          </div>

          {marketError && (
            <p role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {t('Impossible de charger le Market')} : {marketError}
            </p>
          )}

          {/* Results Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-mono text-xs uppercase tracking-[0.3em]">{t('Ouverture du marché...')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {listings.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-4 hover:border-blue-500/30 transition-all shadow-2xl"
                >
                  <div className="relative aspect-[3/4] mb-4">
                    <Card {...item.card} owned={true} />
                  </div>

                  <div className="flex items-center justify-between mb-4 px-2">
                    <Link
                      href={`/showroom/${encodeURIComponent(item.seller?.username ?? profile?.username ?? 'joueur')}`}
                      className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      aria-label={t('Voir le showroom de {username}', { username: item.seller?.username ?? profile?.username ?? 'joueur' })}
                    >
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {(item.seller?.username ?? profile?.username ?? 'J')[0]}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">@{item.seller?.username ?? profile?.username ?? 'joueur'}</span>
                    </Link>
                    <span className="text-[10px] text-gray-600 font-mono">
                      {activeTab === 'my_listings'
                        ? (item.status === 'active' ? t('En vente') : item.status === 'sold' ? t('Vendue') : t('Annulée'))
                        : new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between group-hover:bg-blue-500/10 transition-colors">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{t('Prix d’achat')}</div>
                      <div className="text-lg font-black italic tracking-tighter">▲ {item.price} <span className="text-[10px] not-italic text-gray-400">AC</span></div>
                    </div>
                    {activeTab === 'my_listings' ? (
                      <button
                        onClick={() => void handleCancel(item.id)}
                        disabled={item.status !== 'active' || processingId === item.id}
                        className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                      >
                        {processingId === item.id ? <Loader2Icon size={14} className="animate-spin" /> : null}
                        {t('Annuler')}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item.id, item.price)}
                        disabled={processingId === item.id || item.seller_id === user?.id || (profile && profile.ap < item.price)}
                        className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                      >
                        {processingId === item.id ? <Loader2Icon size={14} className="animate-spin" /> : null}
                        {item.seller_id === user?.id ? t('Votre annonce') : profile && profile.ap < item.price ? t('Solde Insuffisant') : t('Acheter')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        {profile && (
          <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-40 lg:bottom-8 lg:right-8">
            <div className="bg-blue-600 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-400/30">
              <CoinsIcon size={24} className="text-blue-100" />
              <div>
                <div className="text-[10px] uppercase font-black tracking-widest text-blue-200">{t('Balance AC')}</div>
                <div className="text-xl font-black italic tracking-tighter text-white">▲ {profile.ap}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SELL MODAL */}
      <AnimatePresence>
        {isSellModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSellModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-[32px]"
            >
              <div className="flex items-center justify-between border-b border-white/5 p-4 sm:p-8">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">{t('Mettre en vente')}</h2>
                  <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-1">{t('Sélectionnez une pièce de votre garage')}</p>
                </div>
                <button onClick={() => setIsSellModalOpen(false)} aria-label={t('Fermer')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/5">
                  <XIcon size={24} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-8">
                {/* Match the collection: category, favorites, search, rarity and sort. */}
                <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111] p-3 sm:flex-row sm:flex-wrap sm:items-center sm:p-4">
                  <div className="grid w-full grid-cols-4 rounded-xl bg-white/5 p-1 sm:flex sm:w-auto">
                    {(['all', 'vehicle', 'circuit', 'driver'] as const).map((category) => (
                      <button
                        type="button"
                        key={category}
                        onClick={() => setSellCategory(category)}
                        aria-pressed={sellCategory === category}
                        className={`min-h-11 rounded-lg px-1 py-2 text-[9px] font-bold uppercase tracking-wide sm:px-4 sm:text-xs ${sellCategory === category ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        {t(category === 'all' ? 'Tous' : category === 'vehicle' ? 'Véhicules' : category === 'circuit' ? 'Circuits' : 'Pilotes')}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-pressed={sellFavoritesOnly}
                    onClick={() => setSellFavoritesOnly((current) => !current)}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold ${sellFavoritesOnly ? 'border-amber-400/70 bg-amber-400/20 text-amber-200' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    <StarIcon size={18} fill={sellFavoritesOnly ? 'currentColor' : 'none'} />
                    {t('Favoris')}
                  </button>
                  <input
                    type="search"
                    aria-label={t('Rechercher une carte...')}
                    placeholder={t('Rechercher une carte...')}
                    value={sellSearchQuery}
                    onChange={(event) => setSellSearchQuery(event.target.value)}
                    className="min-h-11 w-full min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-base focus:border-blue-500/50 focus:outline-none sm:min-w-[200px] sm:text-sm"
                  />
                  <select
                    aria-label={t('Toutes les raretés')}
                    value={sellRarity}
                    onChange={(event) => setSellRarity(event.target.value as Rarity | 'All')}
                    className="min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base text-white sm:w-auto sm:text-sm [&>option]:bg-[#171717]"
                  >
                    <option value="All">{t('Toutes les raretés')}</option>
                    <option value="Common">{t('Commun')}</option>
                    <option value="Uncommon">{t('Inhabituel')}</option>
                    <option value="Rare">{t('Rare')}</option>
                    <option value="Epic">{t('Épique')}</option>
                    <option value="Legend">{t('Légendaire')}</option>
                    <option value="Icon">{t('Icon')}</option>
                  </select>
                  <select
                    aria-label={t('Trier par Nom')}
                    value={sellSort}
                    onChange={(event) => setSellSort(event.target.value as SellSort)}
                    className="min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base text-white sm:w-auto sm:text-sm [&>option]:bg-[#171717]"
                  >
                    <option value="name">{t('Trier par Nom')}</option>
                    <option value="make-asc">{t('Marques, A à Z')}</option>
                    <option value="make-desc">{t('Marques, Z à A')}</option>
                    <option value="ip-desc">{t('IP, décroissant')}</option>
                    <option value="ip-asc">{t('IP, croissant')}</option>
                    <option value="level-asc">{t('Niveau, croissant')}</option>
                    <option value="level-desc">{t('Niveau, décroissant')}</option>
                    <option value="count-desc">{t('Exemplaires, décroissant')}</option>
                    <option value="count-asc">{t('Exemplaires, croissant')}</option>
                    <option value="rarity">{t('Trier par Rareté')}</option>
                    <option value="newest">{t('Plus récent')}</option>
                  </select>
                </div>

                {sellInventoryError && (
                  <p role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                    {sellInventoryError}
                  </p>
                )}
                {sellInventoryLoading ? (
                  <div className="flex min-h-48 items-center justify-center">
                    <Loader2Icon size={32} className="animate-spin text-blue-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-x-1.5 gap-y-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4">
                    {filteredSellCards.map((item) => (
                      <SellCardItem
                        key={item.id}
                        userCard={item}
                        disabled={creatingListing}
                        onSelect={(price) => void handleCreateListing(item.card_id, item.category, price)}
                      />
                    ))}
                    {filteredSellCards.length === 0 && !sellInventoryError && (
                      <div className="col-span-full py-16 text-center text-sm text-gray-400">
                        {userCards.length === 0
                          ? t('Votre garage est vide')
                          : t('Aucune carte trouvée pour ces critères.')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  async function handleCreateListing(cardId: string, category: CardCategory, price: number) {
    if (!user || creatingListing) return;
    setCreatingListing(true);
    try {
      const res = await createListing(user.id, cardId, price, category);
      if (res.success) {
        alert(t('Annonce créée avec succès !'));
        setIsSellModalOpen(false);
        void refreshListings();
      } else {
        alert(`${t('Erreur')}: ${res.error}`);
        await loadSellInventory(user.id);
      }
    } finally {
      setCreatingListing(false);
    }
  }
}

function SellCardItem({
  userCard, onSelect, disabled,
}: {
  userCard: SellInventoryItem;
  onSelect: (price: number) => void;
  disabled: boolean;
}) {
  const { t } = useSitePreferences();
  const [isSettingPrice, setIsSettingPrice] = useState(false);
  const [price, setPrice] = useState(150);

  if (isSettingPrice) {
    return (
      <div className="col-span-4 flex flex-col items-center justify-center gap-4 rounded-2xl border border-blue-500/50 bg-white/5 p-4 animate-in fade-in zoom-in duration-200 sm:col-span-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">{t('Fixer le prix')}</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={price}
            min={1}
            max={2147483647}
            onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
            className="w-20 bg-black border border-white/10 rounded-lg px-2 py-1 text-center font-mono font-bold"
          />
          <span className="text-xs font-bold text-gray-500">AC</span>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => onSelect(price)}
            disabled={disabled || !Number.isSafeInteger(price) || price < 1 || price > 2147483647}
            className="w-full bg-blue-600 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
          >
            {t('Confirmer')}
          </button>
          <button
            onClick={() => setIsSettingPrice(false)}
            className="w-full bg-white/5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
          >
            {t('Annuler')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative min-w-0">
      <div className="aspect-[63/88] opacity-80 group-hover:opacity-100 transition-opacity">
        <Card {...userCard.card} owned={true} count={userCard.count} mobileGrid onCardClick={() => {
          if (!disabled && userCard.availableCount > 0) setIsSettingPrice(true);
        }} />
      </div>
      <div className="absolute left-1 top-1 z-20 rounded bg-black/85 px-1 py-0.5 text-[8px] font-semibold text-white sm:px-2 sm:py-1 sm:text-[10px]">
        <span className="sm:hidden" aria-label={t('Disponibles')}>×{userCard.availableCount}</span>
        <span className="hidden sm:inline">{userCard.availableCount} {t('Disponibles')}</span>
      </div>
      <button
        type="button"
        aria-label={t('Mettre en vente')}
        disabled={disabled || userCard.availableCount <= 0}
        onClick={() => setIsSettingPrice(true)}
        className="absolute inset-0 flex items-end justify-end rounded-lg bg-gradient-to-t from-black/60 via-transparent to-transparent p-1 opacity-100 transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:items-center sm:justify-center sm:bg-black/60 sm:p-0 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <div className="rounded-md bg-white p-1.5 text-black shadow-xl transition-transform sm:translate-y-4 sm:rounded-2xl sm:p-3 sm:group-hover:translate-y-0">
          <PlusIcon size={16} className="sm:h-6 sm:w-6" />
        </div>
      </button>
    </div>
  );
}