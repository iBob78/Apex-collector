'use client';
export default function Success() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl mb-6 text-[#00B7EB] lowercase">succès débloqués</h2>
      <ul className="list-disc text-sm text-gray-300 space-y-2">
        <li>Posséder 10 cartes – Booster offert</li>
        <li>Premier booster ouvert</li>
        <li>Accéder au marché</li>
      </ul>
    </main>
  );
}
