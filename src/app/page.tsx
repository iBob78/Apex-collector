"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import Card from "@/components/Card";
import Menu from "@/components/Menu";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CardData {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  rarity?: string;
}

export default function Cartes() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase.from("test_table").select("*");

      if (error) {
        console.error("Erreur de récupération:", error.message);
        setError("Impossible de charger les cartes. Veuillez réessayer.");
      } else {
        setCards(data || []);
      }
      setLoading(false);
    }
    fetchCards();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Liste des Cartes</h1>

      {loading ? (
        <p className="text-center text-gray-500">Chargement en cours...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : cards.length === 0 ? (
        <p className="text-center text-gray-500">Aucune carte disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card.id} {...card} />
          ))}
        </div>
      )}
    </div>
  );
}
