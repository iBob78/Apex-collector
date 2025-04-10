'use client';

import React, { useEffect, useState } from "react";

interface Card {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  rarity: string;
}

export default function CollectionPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockCards: Card[] = [
      {
        id: 1,
        name: "Ferrari F40",
        description: "Supercar iconique des années 80.",
        imageUrl: "/cards/f40.jpg",
        rarity: "legendary",
      },
      {
        id: 2,
        name: "Mazda RX-7",
        description: "Classique japonais à moteur rotatif.",
        imageUrl: "/cards/rx7.jpg",
        rarity: "rare",
      },
    ];
    setCards(mockCards);
    setLoading(false);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📖 Ma Collection</h1>
      {loading ? <p>Chargement...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
              <img src={card.imageUrl} alt={card.name} className="w-full h-40 object-cover rounded-md mb-2" />
              <h2 className="text-xl font-bold text-gray-800">{card.name}</h2>
              <p className="text-sm text-gray-600">{card.description}</p>
              <p className="text-sm mt-2">🧬 Rareté : {card.rarity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
