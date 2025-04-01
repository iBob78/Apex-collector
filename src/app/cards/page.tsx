import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Card from "@/components/Card";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Cartes() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        const { data, error } = await supabase.from("test_table").select("*");

        if (error) throw error;
        setCards(data || []);
      } catch (err: any) {
        console.error("Erreur de récupération:", err.message);
        setError("Impossible de charger les cartes. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Liste des Cartes</h1>

      {/* ✅ Affichage dynamique des messages */}
      {loading && <p className="text-center text-gray-500">Chargement en cours...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && cards.length === 0 && (
        <p className="text-center text-gray-500">Aucune carte disponible.</p>
      )}

      {/* ✅ Affichage des cartes si elles existent */}
      {!loading && !error && cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
