import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function AchievementsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <h1 className="text-3xl font-bold">Succès débloqués</h1>

        {/* Succès débloqués */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-gray-800 rounded-xl p-4 space-y-2 shadow">
              <div className="h-20 w-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto" />
              <h3 className="text-center font-semibold">Légende de l’asphalte</h3>
              <p className="text-sm text-center text-gray-400">Débloqué le 12/06/2025</p>
            </div>
          ))}
        </div>

        <Footer />
      </main>
    </div>
  );
}