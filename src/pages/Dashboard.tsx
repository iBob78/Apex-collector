import React from 'react';
import { Link } from 'react-router-dom';

const collectionStats = {
  totalCards: 241,
  legendaryCards: 12,  
  collectionValue: 15430
};

const boosterPacks = [
  {
    id: "standard",
    name: "Standard Pack", 
    price: 250,
    image: "/images/standard-pack.jpg"
  },
  {
    id: "premium", 
    name: "Premium Pack",
    price: 500,
    image: "/images/premium-pack.jpg"
  },
  {
    id: "legendary",
    name: "Legendary Pack",
    price: 1000,
    image: "/images/legendary-pack.jpg" 
  }
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-[#27b6ff] text-5xl font-mono font-bold mb-4">
          Welcome to apex collector
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Build your ultimate automotive trading card collection. Open booster 
          packs, discover legendary cards, and dominate the marketplace.
        </p>
        <Link
          to="/boosters"
          className="inline-block bg-[#27b6ff] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#1a9ff2] transition-colors"
        >
          Open Your First Pack
        </Link>
      </div>

      {/* Collection Stats */}
      <div className="bg-[#1a1d21] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white text-xl font-mono">Your Collection</h2>
          <Link to="/profile" className="text-[#27b6ff] hover:underline">
            View Full Collection
          </Link>
        </div>

        <div className="flex gap-8">
          <div>
            <div className="text-gray-400 text-sm">Total Cards</div>
            <div className="text-[#27b6ff] text-2xl font-mono">{collectionStats.totalCards}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Legendary Cards</div> 
            <div className="text-white text-2xl font-mono">{collectionStats.legendaryCards}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Collection Value</div>
            <div className="text-green-400 text-2xl font-mono">
              ▲ {collectionStats.collectionValue}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}  
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-mono">Recent Achievements</h2>
          <Link to="/achievements" className="text-[#27b6ff] hover:underline">
            View All
          </Link>
        </div>
      </div>

      {/* Booster Packs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-mono">Booster Packs</h2>
          <Link to="/boosters" className="text-[#27b6ff] hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boosterPacks.map(pack => (
            <div key={pack.id} className="bg-[#1a1d21] rounded-xl p-4">
              <img
                src={pack.image}
                alt={pack.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <div className="text-center">
                <h3 className="text-white font-mono mb-2">{pack.name}</h3>
                <div className="text-gray-400 mb-3">▲ {pack.price}</div>
                <button className={`w-full py-2 px-4 rounded-lg font-bold transition-colors ${
                  pack.id === 'legendary' 
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-[#27b6ff] hover:bg-[#1a9ff2]'
                }`}>
                  Open Pack
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection Highlights */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-mono">Your Collection Highlights</h2>
          <div className="flex gap-2">
            <select className="bg-[#1a1d21] text-white rounded-lg px-4 py-2">
              <option>All Rarities</option>
            </select>
            <button className="bg-[#1a1d21] text-white px-4 py-2 rounded-lg">
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}