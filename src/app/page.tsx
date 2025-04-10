"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-2">
        <h1 className="text-2xl font-bold tracking-wide">APEX COLLECTOR</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">🏎️ Ford Mustang GT</span>
          <span className="text-sm">💰 165,296</span>
          <span className="text-sm">🔰 Niveau 35</span>
        </div>
      </div>

      {/* Menu Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
        <button onClick={() => router.push("/collection")} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg">
          📖 Collection
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg">🎴 Boosters</button>
        <button onClick={() => router.push("/marche")} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg">
          💲 Marché
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg">🏆 Succès</button>
        <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg">🔧 Paramètres</button>
        <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg">🏁 Événements</button>
        <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg">🛒 Boutique</button>
        <button className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg">👤 Profil</button>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-6 text-sm text-gray-400">
        <button className="hover:text-white">🎯 GPS</button>
        <button className="hover:text-white">🎥 Caméra</button>
        <button className="hover:text-white">🔍 Zoom</button>
        <button className="hover:text-red-400">❌ Quitter</button>
      </div>
    </div>
  );
}
