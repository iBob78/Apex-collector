'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Rarity } from '@/types/game';

interface UserCardData {
  card_id: string;
  count: number;
}

export default function CollectionPage() {
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [userCards, setUserCards] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'vehicle' | 'circuit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'newest'>('name');

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
          supabase.from('cards').select('*'),
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
          setLoading(false);
          return;
        }

        const [userCardsRes, userCircuitsRes] = await Promise.all([
          supabase.from('user_cards').select('*').eq('user_id', user.id),
          supabase.from('user_circuits').select('*').eq('user_id', user.id)
        ]);

        let ownedMap: Record<string, number> = {};

        // Mapping des véhicules
        userCardsRes.data?.forEach((item: any) => {
          const val = Number(item.count ?? item.quantity ?? 1);
          const rawCid = item.card_id || item.id;
          if (rawCid) {
            const cid = String(rawCid).toLowerCase().trim();
            ownedMap[cid] = (ownedMap[cid] || 0) + val;
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
      } catch (err) {
        console.error('Erreur lors du chargement de la collection:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Logique de filtrage et tri
  const filteredCards = useMemo(() => {
    let result = [...cards];

    // Onglets (Catégorie)
    if (activeTab !== 'all') {
      result = result.filter(c => (c.category || 'vehicle') === activeTab);
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
      // Par défaut: Nom (Make + Model)
      const nameA = `${a.make || ''} ${a.model || a.name || ''}`;
      const nameB = `${b.make || ''} ${b.model || b.name || ''}`;
      return nameA.localeCompare(nameB);
    });

    return result;
  }, [cards, activeTab, searchQuery, rarityFilter, sortBy, userCards]);

  // Statistiques
  const stats = useMemo(() => {
    const total = cards.length;
    // Utilisation de userCards normalisée
    const owned = Object.keys(userCards).length;
    const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
    const totalCopies = Object.values(userCards).reduce((a, b) => a + b, 0);

    return { total, owned, percentage, totalCopies };
  }, [cards, userCards]);

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <div className="p-4 md:p-8 flex-1">
          {/* Header & Stats */}
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                  Mon Garage
                </h1>
                <p className="text-gray-500 font-mono text-sm mt-1">
                  Collection complète des véhicules et circuits d'exception.
                </p>
              </div>

              <div className="flex gap-4">
                <StatCard label="Collection" value={`${stats.owned}/${stats.total}`} sub={`${stats.percentage}%`} color="text-blue-400" />
                <StatCard label="Total Cartes" value={stats.totalCopies} sub="Exemplaires" color="text-purple-400" />
              </div>
            </div>

            {/* Barre de Filtres */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-2xl">
              {/* Tabs */}
              <div className="flex bg-white/5 p-1 rounded-xl">
                {(['all', 'vehicle', 'circuit'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {tab === 'all' ? 'Tous' : tab === 'vehicle' ? 'Véhicules' : 'Circuits'}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Rechercher une carte..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {/* Rarity Select */}
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none"
              >
                <option value="All">Toutes les raretés</option>
                <option value="Common">Commun</option>
                <option value="Uncommon">Inhabituel</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Épique</option>
                <option value="Legend">Légendaire</option>
                <option value="Icon">Icon</option>
              </select>

              {/* Sort Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none"
              >
                <option value="name">Trier par Nom</option>
                <option value="rarity">Trier par Rareté</option>
                <option value="newest">Plus récent</option>
              </select>
            </div>
          </header>

          {/* Grid of Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-mono text-sm uppercase tracking-widest">Initialisation du garage...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredCards.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                >
                  {filteredCards.map((card, index) => {
                    const cid = String((card as any).card_id || card.id).toLowerCase().trim();
                    const c = userCards[cid] || 0;


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
                          owned={c > 0}
                          count={c}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-gray-500 font-mono italic">Aucune carte trouvée pour ces critères.</p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string, value: string | number, sub: string, color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 min-w-[120px]">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{label}</div>
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">{sub}</div>
    </div>
  );
}
