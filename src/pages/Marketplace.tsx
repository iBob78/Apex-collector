import React, { useState } from "react";

const dummyCards = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256",
    name: "Parent group's Marketplace's card's name",
    rarity: "Legendary",
    stats: "Parent group's Marketplace's card's stats",
    price: 1500,
    seller: "SellerA",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256",
    name: "Parent group's Marketplace's card's name",
    rarity: "Epic",
    stats: "Parent group's Marketplace's card's stats",
    price: 750,
    seller: "SellerB",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256",
    name: "Parent group's Marketplace's card's name",
    rarity: "Rare",
    stats: "Parent group's Marketplace's card's stats",
    price: 200,
    seller: "SellerC",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256",
    name: "Parent group's Marketplace's card's name",
    rarity: "Common",
    stats: "Parent group's Marketplace's card's stats",
    price: 50,
    seller: "SellerD",
  },
];

const rarities = ["All Rarities", "Legendary", "Epic", "Rare", "Common"];

export default function Marketplace() {
  const [selectedRarity, setSelectedRarity] = useState("All Rarities");
  const [maxPrice, setMaxPrice] = useState("");

  const filteredCards = dummyCards.filter((card) => {
    const matchesRarity =
      selectedRarity === "All Rarities" || card.rarity === selectedRarity;
    const matchesPrice =
      !maxPrice || card.price <= parseFloat(maxPrice) || isNaN(Number(maxPrice));
    return matchesRarity && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-b from-[#181c20] to-[#181c20]/80 rounded-b-3xl pt-8 pb-14 mb-8">
        <h1 className="text-5xl md:text-6xl font-mono font-bold text-center text-[#27b6ff] mb-3">
          Card Marketplace
        </h1>
        <p className="text-center text-gray-300 text-lg mb-6">
          Buy, sell, and trade premium automotive cards with collectors worldwide
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-end mb-6">
        {/* Filter by Rarity */}
        <div className="flex flex-col">
          <label className="text-gray-300 font-mono mb-1 text-sm">Filter by Rarity</label>
          <select
            className="bg-[#23272b] border border-gray-700 rounded px-3 py-2 text-white"
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
          >
            {rarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </div>
        {/* Max Price */}
        <div className="flex flex-col">
          <label className="text-gray-300 font-mono mb-1 text-sm">Max Price</label>
          <input
            type="number"
            placeholder="Enter max price"
            className="bg-[#23272b] border border-gray-700 rounded px-3 py-2 text-white"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <button className="ml-auto bg-[#13aaff] hover:bg-[#0d8ae6] text-white font-bold rounded px-6 py-2 transition flex items-center gap-2">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Search Marketplace
        </button>
      </div>

      <div className="flex justify-between items-center mb-3 mt-8">
        <h2 className="text-xl font-mono font-semibold text-white">Available Cards</h2>
        <button className="bg-[#23272b] border border-gray-700 text-white rounded px-4 py-2 hover:bg-[#23272b]/80 transition flex items-center gap-2">
          + Sell a Card
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="bg-[#191c20] rounded-2xl shadow-lg flex flex-col p-4 min-h-[410px]"
          >
            <img
              src={card.image}
              alt={card.name}
              className="w-full h-40 object-cover rounded-xl mb-4 border-2 border-gray-800"
            />
            <div className="text-white font-mono font-semibold text-lg mb-1">{card.name}</div>
            <div className="text-sm text-gray-400 mb-1">
              {card.rarity} &nbsp;|&nbsp; {card.stats}
            </div>
            <div className="text-[#27b6ff] font-mono text-xl font-bold mb-2">
              ${card.price}
            </div>
            <div className="text-xs text-gray-400 mb-2">
              by <span className="font-semibold text-gray-300">{card.seller}</span>
            </div>
            <div className="flex gap-2 mt-auto">
              <button className="flex-1 bg-[#13aaff] hover:bg-[#0d8ae6] text-white font-bold rounded py-2 transition">
                <span className="inline-block mr-1">🛒</span> Buy Now
              </button>
              <button className="flex-1 bg-[#23272b] border border-gray-700 text-white rounded py-2 hover:bg-[#23272b]/80 transition">
                Propose Trade
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}