import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function BoostersPage() {
  const packs = [
    { name: 'Pack Commun', desc: '5 cartes aléatoires', color: 'bg-blue-600', price: 250 },
    { name: 'Pack Rare', desc: '7 cartes garanties', color: 'bg-purple-700', price: 500 },
    { name: 'Pack Légendaire', desc: '10 cartes prestigieuses', color: 'bg-yellow-500 text-black', price: 1000 },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">Ouvre un booster !</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packs.map((pack, i) => (
            <div key={i} className={`${pack.color} p-4 rounded-xl shadow`}>
              <h2 className="text-xl font-semibold">{pack.name}</h2>
              <p className="text-sm">{pack.desc}</p>
              <p className="mt-2">💎 {pack.price}</p>
              <button className="mt-3 px-4 py-2 bg-black/30 rounded hover:bg-black/50 transition">
                Ouvrir
              </button>
            </div>
          ))}
        </div>
        <Footer />
      </main>
    </div>
  );
}