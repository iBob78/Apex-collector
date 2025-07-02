'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import Card from '@/components/Card';

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreRarity, setFiltreRarity] = useState('Toutes');

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur chargement cartes:', error);
      } else {
        setCards(data || []);
      }
      setLoading(false);
    };

    fetchCards();
  }, []);

  const cartesFiltrees =
    filtreRarity === 'Toutes'
      ? cards
      : cards.filter((c) => c.rarity === filtreRarity);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">📘 Toutes les Cartes</h1>

        <div className="mb-6">
          <label htmlFor="rarete" className="mr-2 font-medium">
            Filtrer par rareté :
          </label>
          <select
            id="rarete"
            value={filtreRarity}
            onChange={(e) => setFiltreRarity(e.target.value)}
            className="p-2 rounded border border-gray-300 text-black"
          >
            <option value="Toutes">Toutes</option>
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legend">Legend</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400">Chargement des cartes...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {cartesFiltrees.map((card) => (
              <Card
                key={card.card_id}
                card={card}
                owned={true}
              />
            ))}
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}
