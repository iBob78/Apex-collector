'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import { supabase } from '@/lib/supabaseClient';
import { getMarketplaceListings, buyListing, createListing } from '@/lib/actions/marketplace';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, FilterIcon, TagIcon, GavelIcon, CoinsIcon, Loader2Icon, XIcon, PlusIcon } from 'lucide-react';

export default function MarketplacePage() {
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
          .select('*, card:cards(*)')
          .eq('user_id', user.id);
        if (uCards) setUserCards(uCards);
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
    if (!user) return alert('Veuillez vous connecter pour acheter.');
    if (profile && profile.ap < price) return alert('Solde AP insuffisant.');

    if (!confirm(`Voulez-vous acheter cette carte pour ${price} AP ?`)) return;

    setProcessingId(listingId);
    const result = await buyListing(user.id, listingId);

    if (result.success) {
      alert('Achat réussi ! La carte a été ajoutée à votre garage.');
      refreshListings();
      // Update local profile balance
      setProfile({ ...profile, ap: profile.ap - price });
    } else {
      alert(`Erreur: ${result.error}`);
    }
    setProcessingId(null);
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="p-4 md:p-8 flex-1">
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="text-gray-500 font-mono text-sm mt-1">
              Échangez et achetez des pièces rares pour votre écurie.
            </p>

            {/* Navigation Tabs */}
            <div className="flex gap-8 mt-8 border-b border-white/5">
              <button
                onClick={() => setActiveTab('browse')}
                className={`pb-4 px-2 text-sm font-black tracking-widest uppercase transition-all relative ${activeTab === 'browse' ? 'text-blue-500' : 'text-gray-500 hover:text-white'
                  }`}
              >
                Parcourir
                {activeTab === 'browse' && <motion.div layoutId="mkt_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />}
              </button>
              <button
                onClick={() => setActiveTab('my_listings')}
                className={`pb-4 px-2 text-sm font-black tracking-widest uppercase transition-all relative ${activeTab === 'my_listings' ? 'text-blue-500' : 'text-gray-500 hover:text-white'
                  }`}
              >
                Mes Ventes
                {activeTab === 'my_listings' && <motion.div layoutId="mkt_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />}
              </button>
            </div>
          </header>

          {/* Filters Bar */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center gap-4 mb-8">
            <div className="flex-1 min-w-[300px] relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Rechercher une rareté, une marque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3 transition-all">
              <FilterIcon size={18} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest">Filtres</span>
            </button>

            <button
              onClick={() => setIsSellModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl flex items-center gap-3 transition-all shadow-lg shadow-blue-500/20"
            >
              <TagIcon size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Vendre une carte</span>
            </button>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-mono text-xs uppercase tracking-[0.3em]">Ouverture du marché...</p>
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
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {item.seller.username[0]}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">@{item.seller.username}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono">il y a 2h</div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between group-hover:bg-blue-500/10 transition-colors">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Prix d'achat</div>
                      <div className="text-lg font-black italic tracking-tighter">▲ {item.price} <span className="text-[10px] not-italic text-gray-400">AP</span></div>
                    </div>
                    <button
                      onClick={() => handleBuy(item.id, item.price)}
                      disabled={processingId === item.id || (profile && profile.ap < item.price)}
                      className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                    >
                      {processingId === item.id ? <Loader2Icon size={14} className="animate-spin" /> : null}
                      {profile && profile.ap < item.price ? 'Solde Insuffisant' : 'Acheter'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        {profile && (
          <div className="fixed bottom-8 right-8 z-[100]">
            <div className="bg-blue-600 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-blue-400/30">
              <CoinsIcon size={24} className="text-blue-100" />
              <div>
                <div className="text-[10px] uppercase font-black tracking-widest text-blue-200">Balance AP</div>
                <div className="text-xl font-black italic tracking-tighter text-white">▲ {profile.ap}</div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </main>

      {/* SELL MODAL */}
      <AnimatePresence>
        {isSellModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
              className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Mettre en vente</h2>
                  <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-1">Sélectionnez une pièce de votre garage</p>
                </div>
                <button onClick={() => setIsSellModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <XIcon size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
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
                      <p className="font-mono text-sm uppercase tracking-widest">Votre garage est vide</p>
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
      alert('Annonce créée avec succès !');
      setIsSellModalOpen(false);
      refreshListings();
    } else {
      alert(`Erreur: ${res.error}`);
    }
  }
}

function SellCardItem({ userCard, onSelect }: { userCard: any, onSelect: (price: number) => void }) {
  const [isSettingPrice, setIsSettingPrice] = useState(false);
  const [price, setPrice] = useState(150);

  if (isSettingPrice) {
    return (
      <div className="bg-white/5 border border-blue-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-200">
        <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Fixer le prix</div>
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
            className="w-full bg-blue-600 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
          >
            Confirmer
          </button>
          <button
            onClick={() => setIsSettingPrice(false)}
            className="w-full bg-white/5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest"
          >
            Annuler
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
        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
      >
        <div className="bg-white text-black p-3 rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
          <PlusIcon size={24} />
        </div>
      </button>
    </div>
  );
}