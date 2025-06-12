import React from "react";

const unlockedAchievements = [
  {
    id: 1,
    type: "Parent group's Achievement's type",
    reward: "Parent group's Achievement's reward",
  },
  {
    id: 2,
    type: "Parent group's Achievement's type",
    reward: "Parent group's Achievement's reward",
  },
];

const collectionMilestones = [
  {
    id: 1,
    icon: (
      <span className="inline-block bg-blue-800 rounded-full p-2 mr-2">
        <svg width="22" height="22" fill="none" stroke="#4fd1ff" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      </span>
    ),
    title: "Total Cards Collected",
    desc: "Collect cards to unlock themes and rewards",
    value: "Parent group's Collection's quantity",
  },
  {
    id: 2,
    icon: (
      <span className="inline-block bg-orange-900 rounded-full p-2 mr-2">
        <svg width="22" height="22" fill="none" stroke="#ffae42" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
      </span>
    ),
    title: "Rare Cards Owned",
    desc: "Collect rare and legendary cards",
    value: "Parent group's Collection's card's rarity",
  },
];

const stats = [
  { label: "Total Unlocked", value: 12, color: "text-blue-400" },
  { label: "Booster Opens", value: 8 },
  { label: "Successful Trades", value: 5, color: "text-green-400" },
  { label: "Marketplace Sales", value: 3 },
];

const nextRewards = [
  {
    icon: (
      <span className="inline-block bg-blue-800 rounded-full p-2 mr-2">
        <svg width="18" height="18" fill="none" stroke="#4fd1ff" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="4" />
        </svg>
      </span>
    ),
    title: "Carbon Theme",
    desc: "Open 10 more booster packs",
  },
  {
    icon: (
      <span className="inline-block bg-orange-900 rounded-full p-2 mr-2">
        <svg width="18" height="18" fill="none" stroke="#ffae42" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </span>
    ),
    title: "500 Credits",
    desc: "Complete 5 more trades",
  },
  {
    icon: (
      <span className="inline-block bg-yellow-800 rounded-full p-2 mr-2">
        <svg width="18" height="18" fill="none" stroke="#ffd700" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      </span>
    ),
    title: "Legendary Badge",
    desc: "Collect 3 legendary cards",
  },
];

const categories = [
  "All Achievements",
  "Booster Opens",
  "Legendary Cards",
  "Trades",
  "Marketplace Sales",
];

export default function Achievements() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-mono font-bold text-[#27b6ff] mt-8 mb-2">Achievements</h1>
      <p className="text-gray-300 mb-8 font-light">Track your progress and unlock exclusive rewards</p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          {/* Unlocked Achievements */}
          <div className="bg-[#191c20] rounded-xl shadow-lg p-4">
            <div className="text-lg font-mono font-semibold text-[#27b6ff] mb-3">Unlocked Achievements</div>
            <div className="flex flex-col md:flex-row gap-4">
              {unlockedAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex-1 bg-[#181c20] border-2 border-green-600 rounded-xl flex items-center p-4 gap-4"
                >
                  <span className="inline-block bg-green-700 p-2 rounded-full">
                    <svg width="28" height="28" fill="none" stroke="#8fff8f" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12l3 3 5-5" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-white font-semibold">{ach.type}</div>
                    <div className="text-gray-400 text-xs">
                      Reward: {ach.reward}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Milestones */}
          <div className="bg-[#191c20] rounded-xl shadow-lg p-4">
            <div className="text-lg font-mono font-semibold text-[#27b6ff] mb-3">Collection Milestones</div>
            <div className="flex flex-col gap-2">
              {collectionMilestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between bg-[#181c20] rounded-lg p-3">
                  <div className="flex items-center">
                    {milestone.icon}
                    <div>
                      <div className="text-white font-semibold">{milestone.title}</div>
                      <div className="text-gray-400 text-xs">{milestone.desc}</div>
                    </div>
                  </div>
                  <div className="text-[#27b6ff] font-mono font-semibold cursor-pointer hover:underline">
                    {milestone.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full lg:w-[340px]">
          {/* Achievement Stats */}
          <div className="bg-[#191c20] rounded-xl shadow-lg p-4">
            <div className="text-lg font-mono font-semibold text-[#27b6ff] mb-3">Achievement Stats</div>
            <ul>
              {stats.map((s, i) => (
                <li key={i} className="flex justify-between text-white py-1">
                  <span className="text-gray-300">{s.label}</span>
                  <span className={`font-mono font-semibold ${s.color || ""}`}>
                    {s.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Next Rewards */}
          <div className="bg-[#191c20] rounded-xl shadow-lg p-4">
            <div className="text-lg font-mono font-semibold text-[#27b6ff] mb-3">Next Rewards</div>
            <div className="flex flex-col gap-2">
              {nextRewards.map((r, i) => (
                <div key={i} className="flex items-center bg-[#181c20] rounded-lg p-3">
                  {r.icon}
                  <div>
                    <div className="text-white font-semibold">{r.title}</div>
                    <div className="text-gray-400 text-xs">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Achievement Categories */}
          <div className="bg-[#191c20] rounded-xl shadow-lg p-4">
            <div className="text-lg font-mono font-semibold text-[#27b6ff] mb-3">Achievement Categories</div>
            <ul>
              {categories.map((cat, i) => (
                <li key={i} className="text-gray-200 hover:text-[#27b6ff] cursor-pointer py-1">
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}