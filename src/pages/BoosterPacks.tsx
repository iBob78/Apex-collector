import React, { useState } from "react";

const packTypes = [
  {
    id: "common",
    name: "Common Pack",
    description: "5 cards guaranteed",
    button: "Open Common Pack",
    color: "bg-gray-700 border-gray-600",
    buttonColor: "bg-gray-700 hover:bg-gray-800",
    highlight: false,
    odds: "Chance of rare: 10%",
    price: "100 credits",
    icon: (
      <span className="inline-block bg-gray-600 rounded-full p-2 mr-2">
        <svg width="22" height="22" fill="none" stroke="#bbb" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="4" />
        </svg>
      </span>
    ),
  },
  {
    id: "rare",
    name: "Rare Pack",
    description: "7 cards with rare guarantee",
    button: "Open Rare Pack",
    color: "bg-blue-900 border-blue-700",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    highlight: true,
    odds: "Chance of epic: 20%",
    price: "300 credits",
    icon: (
      <span className="inline-block bg-blue-700 rounded-full p-2 mr-2">
        <svg width="22" height="22" fill="none" stroke="#4fd1ff" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </span>
    ),
  },
  {
    id: "epic",
    name: "Epic Pack",
    description: "10 cards with epic guarantee",
    button: "Open Epic Pack",
    color: "bg-purple-900 border-purple-700",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
    highlight: false,
    odds: "Chance of legendary: 8%",
    price: "700 credits",
    icon: (
      <span className="inline-block bg-purple-700 rounded-full p-2 mr-2">
        <svg width="22" height="22" fill="none" stroke="#a78bfa" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </span>
    ),
  },
  {
    id: "legendary",
    name: "Legendary Pack",
    description: "15 cards with legendary guarantee",
    button: "Open Legendary Pack",
    color: "bg-yellow-900 border-yellow-700",
    buttonColor: "bg-yellow-500 hover:bg-yellow-600 text-black",
    highlight: false,
    odds: "Guaranteed legendary inside",
    price: "2000 credits",
    icon: (
      <span className="inline-block bg-yellow-600 rounded-full p-2 mr-2">
        <svg width="22" height="22" fill="none" stroke="#ffd700" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l2 2" />
        </svg>
      </span>
    ),
  },
];

const openingHistory = [
  { date: "2025-06-11", pack: "Epic Pack", cards: 10, rares: 2, legendaries: 1 },
  { date: "2025-06-10", pack: "Rare Pack", cards: 7, rares: 1, legendaries: 0 },
  { date: "2025-06-09", pack: "Common Pack", cards: 5, rares: 0, legendaries: 0 },
  { date: "2025-06-08", pack: "Legendary Pack", cards: 15, rares: 4, legendaries: 2 },
];

const progressStats = {
  totalOpened: 53,
  rarePacks: 18,
  epicPacks: 9,
  legendaryPacks: 3,
  totalRares: 24,
  totalEpics: 8,
  totalLegendaries: 4,
  nextReward: "Unlock Carbon Theme (open 7 more packs)",
};

export default function BoosterPacks() {
  const [opening, setOpening] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-b from-[#181c20] to-[#181c20]/80 rounded-b-3xl pt-8 pb-14 mb-8">
        <h1 className="text-5xl md:text-6xl font-mono font-bold text-center text-[#27b6ff] mb-3">
          Open Booster Packs
        </h1>
        <p className="text-center text-gray-300 text-lg mb-6">
          Experience the thrill of discovery with our premium automotive trading card packs. Each pack contains rare vehicles and exclusive collectibles.
        </p>
        <div className="flex justify-center">
          <button
            className="bg-gradient-to-r from-blue-500 to-orange-400 hover:from-blue-600 hover:to-orange-500 text-white font-bold rounded-lg px-8 py-3 text-lg shadow-lg transition"
            onClick={() => setOpening("random")}
          >
            ✨ Open Booster Pack
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-10">
        <h2 className="text-xl font-mono font-semibold text-white mb-1">Pack Opening Progress</h2>
        <p className="text-gray-400 mb-4">Track your booster pack achievements and unlock exclusive rewards</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#191c20] rounded-xl p-6 shadow-lg">
            <div className="text-md font-mono text-gray-200">Total Packs Opened</div>
            <div className="text-3xl font-bold text-[#27b6ff]">{progressStats.totalOpened}</div>
            <div className="mt-2 text-xs text-gray-400">Next reward: <span className="text-orange-400">{progressStats.nextReward}</span></div>
          </div>
          <div className="bg-[#191c20] rounded-xl p-6 shadow-lg flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="font-mono text-gray-200">Rare Packs</span>
              <span className="text-blue-300">{progressStats.rarePacks}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-200">Epic Packs</span>
              <span className="text-purple-300">{progressStats.epicPacks}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-200">Legendary Packs</span>
              <span className="text-yellow-300">{progressStats.legendaryPacks}</span>
            </div>
          </div>
          <div className="bg-[#191c20] rounded-xl p-6 shadow-lg flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="font-mono text-gray-200">Rares Found</span>
              <span className="text-blue-400">{progressStats.totalRares}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-200">Epics Found</span>
              <span className="text-purple-400">{progressStats.totalEpics}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-gray-200">Legendaries Found</span>
              <span className="text-yellow-400">{progressStats.totalLegendaries}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pack types */}
      <div className="mb-14">
        <h2 className="text-2xl font-mono font-semibold text-white mb-2">Available Pack Types</h2>
        <p className="text-gray-400 mb-6">Choose from different pack rarities to maximize your collection potential</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {packTypes.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-xl border-2 shadow-lg p-6 flex flex-col items-center min-h-[230px] ${pack.color} ${pack.highlight ? "border-blue-500" : ""}`}
            >
              <div className="flex items-center mb-2">{pack.icon}
                <span className={`text-lg font-bold font-mono ${pack.highlight ? "text-blue-400" : "text-white"}`}>{pack.name}</span>
              </div>
              <div className="text-gray-300 mb-1">{pack.description}</div>
              <div className="text-xs text-gray-400 mb-2">{pack.odds}</div>
              <div className="text-xs text-gray-400 mb-3">{pack.price}</div>
              <button
                className={`w-full font-bold rounded py-2 mt-auto transition ${pack.buttonColor}`}
                onClick={() => setOpening(pack.id)}
              >
                {pack.button}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Opening History */}
      <div className="mb-16">
        <h2 className="text-xl font-mono font-semibold text-white mb-2">Recent Pack Openings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#191c20] rounded-xl shadow-lg overflow-hidden">
            <thead>
              <tr className="text-gray-400 text-sm font-mono">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Pack Type</th>
                <th className="py-3 px-4">Cards</th>
                <th className="py-3 px-4">Rares</th>
                <th className="py-3 px-4">Legendaries</th>
              </tr>
            </thead>
            <tbody>
              {openingHistory.map((row, i) => (
                <tr key={i} className="text-white text-center border-t border-[#222]">
                  <td className="py-2 px-4">{row.date}</td>
                  <td className="py-2 px-4">{row.pack}</td>
                  <td className="py-2 px-4">{row.cards}</td>
                  <td className="py-2 px-4">{row.rares}</td>
                  <td className="py-2 px-4">{row.legendaries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}