import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function CollectionPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Ma Collection</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="bg-gray-800 rounded-xl p-4">
              <div className="h-40 bg-gray-700 rounded mb-2" />
              <h2 className="font-semibold">Carte {idx + 1}</h2>
              <p className="text-sm text-gray-400">Rareté : Épique</p>
              <p className="text-sm text-gray-400">Stat : +12 Prestige</p>
            </div>
          ))}
        </div>

        <Footer />
      </main>
    </div>
  );
}