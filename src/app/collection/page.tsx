"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Card from "@/components/Card.tsx"; // Alias corrigé

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface CardData {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  rarity?: string;
}

export default function CollectionPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        const { data, error } = await supabase.from("test_table").select("*");

        if (error) {
          console.error("Erreur de récupération:", error.message);
          setError("Impossible de charger les cartes. Veuillez réessayer.");
        } else {
          setCards(data || []);
        }
      } catch (err) {
        console.error("Erreur inconnue:", err);
        setError("Une erreur inattendue est survenue.");
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  return (
    <div className="p-4 text-white bg-gradient-to-r from-gray-900 to-gray-800 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">📖 Ma Collection</h1>

      {loading && <p className="text-center text-gray-400">Chargement en cours...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && cards.length === 0 ? (
        <p className="text-center text-gray-500">Aucune carte disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card
              key={card.id}
              name={card.name}
              imageUrl={card.image_url}
              description={card.description}
              rarity={card.rarity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
