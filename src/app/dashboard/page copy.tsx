import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">Bienvenue dans Apex Collector</h1>
        <p className="text-gray-400 mb-8">Ouvre des boosters, découvre des cartes légendaires et commence ta collection de cartes à jouer.</p>
        {/* Tu pourras insérer ici les composants de cartes, stats, etc. */}
        <Footer />
      </main>
    </div>
  );
}