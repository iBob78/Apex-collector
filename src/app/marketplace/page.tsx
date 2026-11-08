'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import { supabase } from '@/lib/supabaseClient';
import { getMarketplaceListings, buyListing, createListing } from '@/lib/actions/marketplace';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, FilterIcon, TagIcon, GavelIcon, CoinsIcon, Loader2Icon, XIcon, PlusIcon } from 'lucide-react';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function MarketplacePage() {
  const { t } = useSitePreferences();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'my_listings'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(prof);

        // Fetch user cards for selling
        const { data: uCards } = await supabase
          .from('user_cards')
          .select('*, card:cards!inner(*)')
          .eq('user_id', user.id);
        if (uCards) setUserCards(uCards.filter((userCard) => userCard.card?.is_active !== false));
      }
    };
    fetchSession();
  }, []);

  const refreshListings = async () => {
    setLoading(true);
    const { data } = await getMarketplaceListings();
    if (data) setListings(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshListings();
  }, []);

  const handleBuy = async (listingId: string, price: number) => {
    if (!user) return alert(t('Veuillez vous connecter pour acheter.'));
    if (profile && profile.ap < price) return alert(t('Solde AP insuffisant.'));

    if (!confirm(t('Voulez-vous acheter cette carte pour {price} AP ?', { price }))) return;

    setProcessingId(listingId);
    const result = await buyListing(user.id, listingId);

    if (result.success) {
      alert(t('Achat réussi ! La carte a été ajoutée à votre garage.'));
      refreshListings();
      // Update local profile balance
      setProfile({ ...profile, ap: profile.ap - price });
    } else {
      alert(`${t('Erreur')}: ${result.error}`);
    }
    setProcessingId(null);
  };

  return (
    <div className="apex-paddock flex min-h-screen text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 flex flex-col">
        <div className="paddock-shell flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10">
          {/* Header */}
          <header className="mb-8 overflow-hidden border border-white/20 bg-[#101510]">
            <div className="race-photo-soft relative isolate overflow-hidden px-5 py-9 sm:px-9 sm:py-11">
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#101215] via-[#101215]/85 to-transparent"/>
              <span className="absolute -right-2 -top-12 select-none font-['Barlow_Condensed'] text-[210px] font-black leading-none text-white/[.05] sm:text-[290px]" aria-hidden="true">04</span>
              <div className="relative z-10">
                <p className="race-eyebrow">04 / TRADING PADDOCK</p>
                <h1 className="paddock-title mt-5 max-w-4xl">MARKET<span className="text-[#F0EFEB]">PLACE.</span></h1>
                <p className="mt-5 max-w-lg border-l-[3px] border-[#D32F35] pl-4 text-sm leading-relaxed text-gray-300">
                  {t('Échangez et achetez des pièces rares pour votre écurie.')}
                </p>
                <div className="mt-7 inline-flex gap-3 border border-white/20 bg-[#171A1E]/90 px-4 py-3">
                  <span className="font-['Barlow_Condensed'] text-[44px] font-black leading-[.85] text-[#F0EFEB]">{listings.length}</span>
                  <span className="self-end font-['Barlow_Condensed'] text-[12px] font-extrabold uppercase tracking-[.14em] text-gray-300">CARDS / MARKET INVENTORY</span>
                </div>
              </div>
            </div>
            <nav className="flex gap-[2px] bg-[#555D65] p-[2px]" aria-label={t('Marketplace')}>
              <button type="button" onClick={() => setActiveTab('browse')}
                aria-pressed={activeTab === 'browse'}
                className={`relative flex min-h-12 flex-1 items-center justify-center gap-3 px-4 font-['Barlow_Condensed'] text-[15px] font-black uppercase tracking-[.1em] transition-colors ${activeTab === 'browse' ? 'bg-[#D32F35] text-[#F0EFEB]' : 'bg-[#171A1E] text-gray-300 hover:text-white'}`}>
                <span className="text-[11px] opacity-60">01</span>{t('Parcourir')}
              </button>
              <button type="button" onClick={() => setActiveTab('my_listings')}
                aria-pressed={activeTab === 'my_listings'}
                className={`relative flex min-h-12 flex-1 items-center justify-center gap-3 px-4 font-['Barlow_Condensed'] text-[15px] font-black uppercase tracking-[.1em] transition-colors ${activeTab === 'my_listings' ? 'bg-[#D32F35] text-[#F0EFEB]' : 'bg-[#171A1E] text-gray-300 hover:text-white'}`}>
                <span className="text-[11px] opacity-60">02</span>{t('Mes Ventes')}
              </button>
            </nav>
          </header>

          {/* Filters Bar */}
          <div className="mb-7 flex flex-wrap items-center gap-3 border border-white/20 bg-[#232930] p-4 sm:gap-4">
            <div className="relative w-full min-w-0 flex-1 sm:min-w-[240px]">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder={t('Rechercher une rareté, une marque...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="paddock-field min-h-11 w-full rounded-xl py-3 pl-12 pr-4 text-base transition-colors sm:text-sm"
              />
            </div>


            <button
              onClick={() => setIsSellModalOpen(true)}
              className="paddock-action flex min-h-11 items-center gap-3 px-5 py-3"
            >
              <TagIcon size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{t('Vendre une carte')}</span>
            </button>
          </div>

          {/* Edition readout: no fabricated live market statistics. */}
          <div className="race-section-heading mb-5 justify-between gap-3">
            <div>
              <p className="paddock-eyebrow">APEX / MARKET INVENTORY</p>
              <h2 className="paddock-section-title mt-2">{t('Parcourir')}</h2>
            </div>
            <div className="border-l-[3px] border-[#D32F35] bg-[#232930] px-3 py-2 font-mono text-xs text-[#F0EFEB]">
              {listings.length} {t('Cartes')}
            </div>
          </div>
          {/* Results Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="w-10 h-10 border-4 border-[#555D65] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-mono text-xs uppercase tracking-[0.3em]">{t('Ouverture du marché...')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {listings.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="paddock-data-card group relative p-4 shadow-2xl"
                >
                  <div className="relative aspect-[3/4] mb-4">
                    <Card {...item.card} owned={true} />
                  </div>

                  <div className="flex items-center justify-between mb-4 px-2">
                    <Link
                      href={`/showroom/${encodeURIComponent(item.seller.username)}`}
                      className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      aria-label={t('Voir le showroom de {username}', { username: item.seller.username })}
                    >
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {item.seller.username[0]}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">@{item.seller.username}</span>
                    </Link>
                    <div className="text-[10px] text-gray-600 font-mono">{t('il y a 2h')}</div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#555D65]/10 bg-[#171A1E]/85 p-3 transition-colors group-hover:border-[#555D65]/25 sm:p-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{t('Prix d’achat')}</div>
                      <div className="text-lg font-black italic tracking-tighter">▲ {item.price} <span className="text-[10px] not-italic text-gray-400">AP</span></div>
                    </div>
                    <button
                      onClick={() => handleBuy(item.id, item.price)}
                      disabled={processingId === item.id || (profile && profile.ap < item.price)}
                      className="paddock-action flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs disabled:opacity-50 sm:px-4"
                    >
                      {processingId === item.id ? <Loader2Icon size={14} className="animate-spin" /> : null}
                      {profile && profile.ap < item.price ? t('Solde Insuffisant') : t('Acheter')}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        {profile && (
          <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-40 lg:bottom-8 lg:right-8">
            <div className="paddock-panel flex items-center gap-3 px-4 py-3 shadow-2xl sm:px-6 sm:py-4">
              <CoinsIcon size={24} className="text-[#F0EFEB]" />
              <div>
                <div className="text-[10px] uppercase font-black tracking-widest text-[#F0EFEB]">{t('Balance AP')}</div>
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
              className="paddock-panel relative flex h-[100dvh] max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-[26px]"
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 md:grid-cols-4">
                  {userCards.map((uc) => (
                    <SellCardItem
                      key={uc.id}
                      userCard={uc}
                      onSelect={(price) => {
                        handleCreateListing(uc.card_id, price);
                      }}
                    />
                  ))}
                  {userCards.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-30">
                      <p className="font-mono text-sm uppercase tracking-widest">{t('Votre garage est vide')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  async function handleCreateListing(cardId: string, price: number) {
    if (!user) return;
    const res = await createListing(user.id, cardId, price);
    if (res.success) {
      alert(t('Annonce créée avec succès !'));
      setIsSellModalOpen(false);
      refreshListings();
    } else {
      alert(`${t('Erreur')}: ${res.error}`);
    }
  }
}

function SellCardItem({ userCard, onSelect }: { userCard: any, onSelect: (price: number) => void }) {
  const { t } = useSitePreferences();
  const [isSettingPrice, setIsSettingPrice] = useState(false);
  const [price, setPrice] = useState(150);

  if (isSettingPrice) {
    return (
      <div className="bg-white/5 border border-[#555D65]/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-200">
        <div className="text-[10px] font-black uppercase tracking-widest text-[#F0EFEB]">{t('Fixer le prix')}</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
            className="w-20 bg-black border border-white/10 rounded-lg px-2 py-1 text-center font-mono font-bold"
          />
          <span className="text-xs font-bold text-gray-500">AP</span>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => onSelect(price)}
            className="w-full bg-[#D32F35] py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
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
    <div className="group relative">
      <div className="aspect-[63/88] opacity-80 group-hover:opacity-100 transition-opacity">
        <Card {...userCard.card} owned={true} count={userCard.count} />
      </div>
      <button
        onClick={() => setIsSettingPrice(true)}
        className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-100 transition-opacity sm:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <div className="bg-white text-black p-3 rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
          <PlusIcon size={24} />
        </div>
      </button>
    </div>
  );
}