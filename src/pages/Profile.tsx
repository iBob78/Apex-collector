import React from "react";

const user = {
  username: "Current User's username",
  totalCards: 240,
  legendaryCount: 12,
  achievementsCount: 8,
  currentTheme: "Light",
};

const collection = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256",
    name: "Parent group’s Collection’s card’s name",
    rarity: "Legendary",
    quantity: 3,
    group: "Group A",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256",
    name: "Parent group’s Collection’s card’s name",
    rarity: "Rare",
    quantity: 1,
    group: "Group B",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256",
    name: "Parent group’s Collection’s card’s name",
    rarity: "Common",
    quantity: 5,
    group: "Group C",
  },
];

const achievements = [
  {
    id: 1,
    type: "Legendary Collector",
    reward: "Special Badge",
    group: "Collection A",
  },
  {
    id: 2,
    type: "Milestone Reached",
    reward: "XP Boost",
    group: "Season 2",
  },
];

export default function Profile() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-6">
        {/* User Card */}
        <div className="bg-[#191c20] rounded-xl shadow-lg flex flex-col items-center p-6 md:col-span-1">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-blue-300 border-4 border-gray-800 mb-4 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#d1d5db" />
              <rect x="4" y="16" width="16" height="6" rx="3" fill="#d1d5db" />
            </svg>
          </div>
          <div className="text-xl font-bold font-mono text-white text-center mb-4">{user.username}</div>
          <div className="flex flex-col items-center gap-1 mb-2">
            <span className="text-blue-400 text-sm underline cursor-pointer">Search for Collections: each item’s quantity: sum</span>
            <span className="text-gray-400 text-xs">Total Cards</span>
            <span className="text-blue-400 text-sm underline cursor-pointer">Search for Collections: count</span>
            <span className="text-gray-400 text-xs">Legendary</span>
            <span className="text-green-400 text-sm underline cursor-pointer">Search for Achievements: count</span>
            <span className="text-gray-400 text-xs">Achievements</span>
          </div>
        </div>
        {/* My Collection */}
        <div className="bg-[#191c20] rounded-xl shadow-lg p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold font-mono text-white">My Collection</div>
            <button className="bg-[#23272b] border border-gray-700 text-white rounded px-4 py-1 text-sm hover:bg-[#23272b]/80 transition">
              View All Cards
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.map((card) => (
              <div key={card.id} className="bg-[#23272b] rounded-lg p-3 flex flex-col items-center">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-24 h-24 object-cover rounded-lg mb-2 border-2 border-gray-800"
                />
                <div className="text-white font-semibold text-center mb-1">{card.name}</div>
                <div className="text-xs text-gray-400 text-center">
                  {card.group}<br />
                  <span className="text-blue-400 font-semibold">{card.rarity}</span> &nbsp;·&nbsp;
                  <span className="text-white">{card.quantity}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Current Theme */}
        <div className="bg-[#191c20] rounded-xl shadow-lg p-6 flex flex-col">
          <div className="text-md font-semibold font-mono text-white mb-2">Current Theme</div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-6 h-6 rounded bg-gradient-to-tr from-blue-200 to-blue-500" />
            <span className="text-white">{user.currentTheme}</span>
          </div>
          <button className="bg-[#23272b] border border-gray-700 text-white rounded py-2 hover:bg-[#23272b]/80 transition">
            Change Theme
          </button>
        </div>
        {/* Recent Achievements */}
        <div className="bg-[#191c20] rounded-xl shadow-lg p-6 md:col-span-2">
          <div className="text-lg font-semibold font-mono text-white mb-4">Recent Achievements</div>
          <div className="flex flex-col md:flex-row gap-4">
            {achievements.map((ach) => (
              <div key={ach.id} className="flex-1 bg-[#23272b] rounded-lg p-4 flex items-center gap-4">
                <span className="inline-block bg-blue-700 p-2 rounded-full">
                  <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 13a4 4 0 0 0 8 0M9 9h6" />
                  </svg>
                </span>
                <div>
                  <div className="text-white font-semibold">{ach.type}</div>
                  <div className="text-gray-400 text-xs">{ach.group}</div>
                  <div className="text-blue-400 text-xs">{ach.reward}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-[#23272b] border border-gray-700 text-white rounded py-2 hover:bg-[#23272b]/80 transition text-sm">
            View All Achievements
          </button>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="bg-[#191c20] rounded-xl shadow-lg p-6 mb-12 flex flex-col md:flex-row gap-4">
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded py-2 transition">
          <span className="inline-block mr-2">👤</span> Edit Profile
        </button>
        <button className="flex-1 bg-[#23272b] border border-gray-700 text-white rounded py-2 hover:bg-[#23272b]/80 transition">
          Privacy Settings
        </button>
        <button className="flex-1 bg-[#23272b] border border-gray-700 text-white rounded py-2 hover:bg-[#23272b]/80 transition">
          <span className="inline-block mr-2">⬇️</span> Export Collection
        </button>
      </div>
    </div>
  );
}