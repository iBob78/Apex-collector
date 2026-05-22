'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import Card from '@/components/Card'; // Composant mis à jour

export default function CollectionPage() {
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [ownedCardIds, setOwnedCardIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentification
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Récupère toutes les cartes + celles possédées
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: allCards, error: err1 } = await supabase
        .from('cards')
        .select('*')
        .order('name', { ascending: true });

      const { data: userCards, error: err2 } = await supabase
        .from('user_cards')
        .select('card_id')
        .eq('user_id', user.id);

      if (err1 || err2) {
        console.error('Erreur chargement :', err1 || err2);
      } else {
        setCards(allCards || []);
        setOwnedCardIds(userCards?.map((c) => c.card_id) || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Ma collection</h1>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                owned={ownedCardIds.includes(card.id)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
