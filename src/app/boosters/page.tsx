'use client';
import { useState } from 'react';

export default function Booster() {
  const [opened, setOpened] = useState(false);

  return (
    <main className="flex flex-col items-center min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl mb-6 text-[#00B7EB] lowercase">ouvrir un booster</h2>
      {!opened ? (
        <button onClick={() => setOpened(true)} className="bg-blue-700 px-6 py-2 rounded-lg hover:bg-blue-600">
          Ouvrir un booster
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-gray-900 p-2 rounded-lg w-[132px] h-[176px] flex flex-col items-center justify-between">
              <div className="w-full h-[80px] bg-gray-700 mb-2" />
              <div className="text-xs">Carte #{i + 1}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
