'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Carte from './Carte';

interface Card {
  id: string;
  name: string;
  image_url?: string;
  // ajoute ici les autres champs selon ta table `cards`
}

interface UserCard {
  card_id: string;
}

export default function HybridCollection() {
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [userCardIds, setUserCardIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupère l'utilisateur
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error('Erreur récupération user:', error.message);
        return;
      }
      setUser(data?.user);
    });
  }, []);

  // Charge les cartes globales + celles du joueur
  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      const { data: toutesLesCartes, error: cartesError } = await supabase
        .from('cards')
        .select('*')
        .order('name', { ascending: true });

      if (cartesError) {
        console.error('Erreur récupération cartes:', cartesError.message);
        return;
      }

      const { data: cartesJoueur, error: joueurError } = await supabase
        .from('user_cards')
        .select('card_id')
        .eq('user_id', user.id);

      if (joueurError) {
        console.error('Erreur récupération cartes joueur:', joueurError.message);
        return;
      }

      setCards(toutesLesCartes || []);
      setUserCardIds(cartesJoueur?.map((c: UserCard) => c.card_id) || []);
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {cards.map((card) => (
        <Carte
          key={card.id}
          card={card}
          owned={userCardIds.includes(card.id)}
        />
      ))}
    </div>
  );
}
