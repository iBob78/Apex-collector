'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Barre de statut utilisateur */}
        <div className="flex justify-end mb-4">
          {user && (
            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-800 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              👤 {user.email}
            </button>
          )}
        </div>

        {/* Contenu principal */}
        <h1 className="text-3xl font-bold mb-4">Bienvenue dans Apex Collector</h1>
        <p className="text-gray-400 mb-8">
          Ouvre des boosters, découvre des cartes légendaires et commence ta collection de cartes à jouer.
        </p>

        {/* Tu pourras insérer ici les composants de cartes, stats, etc. */}
        <Footer />
      </main>
    </div>
  );
}