"use client";

import React, { useEffect, useState } from "react";

interface MarketCard {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  rarity: string;
  price: number;
  seller: string;
}

export default function MarketPage() {
  const [cards, setCards] = useState<MarketCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockMarket: MarketCard[] = [
      {
        id: 1,
        name: "Toyota Supra",
        description: "Légende japonaise au turbo rageur.",
        imageUrl: "/cards/supra.jpg",
        rarity: "epic",
        price: 2500,
        seller: "Speedy93",
      },
      {
        id: 2,
        name: "Bugatti Chiron",
        description: "Puissance extrême, luxe absolu.",
        imageUrl: "/cards/chiron.jpg",
        rarity: "legendary",
        price: 12500,
        seller: "LuxuryCarz",
      },
    ];

    setCards(mockMarket);
    setLoading(false);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">💲 Marché</h1>
      {loading ? <p>Chargement...</p> : cards.length === 0 ? (
        <p>Aucune carte en vente pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
              <img src={card.imageUrl} alt={card.name} className="w-full h-40 object-cover rounded-md mb-2" />
              <h2 className="text-xl font-bold text-gray-800">{card.name}</h2>
              <p className="text-sm text-gray-600">{card.description}</p>
              <p className="text-sm mt-2">🧬 Rareté : {card.rarity}</p>
              <p className="text-sm">👤 Vendeur : {card.seller}</p>
              <p className="text-lg font-semibold mt-2">💰 {card.price} crédits</p>
              <button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">Acheter</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}