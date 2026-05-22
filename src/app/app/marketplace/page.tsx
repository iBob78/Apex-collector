import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function MarketplacePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">Marketplace</h1>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select className="bg-gray-800 text-white p-2 rounded">
            <option>Rareté</option>
            <option>Commune</option>
            <option>Rare</option>
            <option>Légendaire</option>
          </select>
          <input type="number" placeholder="Prix max 💎" className="bg-gray-800 text-white p-2 rounded w-40" />
          <button className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700 transition">Rechercher</button>
        </div>

        {/* Liste de cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-gray-800 rounded-xl p-4 space-y-2">
              <div className="h-40 bg-gray-700 rounded mb-2" />
              <h2 className="font-semibold text-white">Carte #{idx + 1}</h2>
              <p className="text-sm text-gray-400">Rareté : Rare</p>
              <p className="text-sm text-gray-400">Prix : 💎 450</p>
              <p className="text-sm text-gray-400">Vendeur : @player123</p>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 bg-cyan-600 py-1 rounded hover:bg-cyan-700 text-sm">Acheter</button>
                <button className="flex-1 bg-gray-700 py-1 rounded hover:bg-gray-600 text-sm">Échanger</button>
              </div>
            </div>
          ))}
        </div>

        <Footer />
      </main>
    </div>
  );
}