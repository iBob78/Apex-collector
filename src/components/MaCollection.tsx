'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Carte from './Carte';

export default function MaCollection() {
  const [cartes, setCartes] = useState([]);
  const [user, setUser] = useState(null);

  // Récupère l'utilisateur connecté
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Une fois l'utilisateur chargé, on va chercher ses cartes
  useEffect(() => {
    if (!user) return;

    const fetchCartes = async () => {
      const { data, error } = await supabase
        .from('user_cards')
        .select('quantity, cards (name, rarity, image_url, power_hp, torque_nm, max_speed_kmh)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur chargement collection:', error);
      } else {
        const cartesFormatees = data.map((item) => ({
          quantity: item.quantity,
          ...item.cards,
        }));
        setCartes(cartesFormatees);
      }
    };

    fetchCartes();
  }, 