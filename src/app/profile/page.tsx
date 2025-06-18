import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <h1 className="text-3xl font-bold">Mon Profil</h1>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Cartes possédées</h3>
            <p className="text-2xl font-bold">241</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Succès débloqués</h3>
            <p className="text-2xl font-bold">13</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Échanges</h3>
            <p className="text-2xl font-bold">22</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Thème actif</h2>
          <p className="text-gray-400">Dark Carbon</p>
        </section>

        <section className="flex gap-4">
          <button className="bg-gray-700 py-2 px-4 rounded hover:bg-gray-600">Modifier</button>
          <button className="bg-gray-700 py-2 px-4 rounded hover:bg-gray-600">Exporter (.csv)</button>
        </section>

        <Footer />
      </main>
    </div>
  );
}