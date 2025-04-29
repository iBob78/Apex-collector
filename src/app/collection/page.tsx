'use client';
import Image from 'next/image';

export default function Collection() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl mb-6 text-[#00B7EB] lowercase">ma collection</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Exemple de carte */}
        <div className="bg-gray-900 p-2 rounded-lg w-[132px] h-[176px] flex flex-col items-center justify-between">
          <Image src="/placeholder-car.jpg" alt="car" width={120} height={80} className="rounded" />
          <div className="text-xs mt-2">Nom du véhicule</div>
          <div className="text-[10px] text-gray-400">Statistiques</div>
        </div>
      </div>
    </main>
  );
}
