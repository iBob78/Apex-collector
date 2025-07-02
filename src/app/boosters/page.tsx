'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { ajouterCarteAuJoueur } from '@/lib/actions/carte';

export default function BoostersPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) return <p>Chargement...</p>;

  const packs = [
    { name: 'Pack Commun', desc: '5 cartes aléatoires', color: 'bg-blue-600', price: 250, slug: 'common' },
    { name: 'Pack Rare', desc: '7 cartes garanties', color: 'bg-purple-700', price: 500, slug: 'rare' },
    { name: 'Pack Légendaire', desc: '10 cartes prestigieuses', color: 'bg-yellow-500 text-black', price: 1000, slug: 'legend' },
  ];

  // 🃏 Exemple de tirage test avec une carte fixe
  const handleTestOpen = async () => {
    setMessage('Ouverture en cours...');
    const result = await ajouterCarteAuJoueur(user.id, '03c46cb2-a231-46fb-9080-2d08a46c60a0');
    setMessage(
      result.success
        ? `✔️ Carte ${result.action === 'incrément' ? 'ajoutée (doublon)' : 'débloquée'} !`
        : '❌ Erreur lors de l’attribution'
    );
  };

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
              <button
                className="mt-3 px-4 py-2 bg-black/30 rounded hover:bg-black/50 transition"
                onClick={() => router.push(`/open?pack=${pack.slug}`)}
              >
                Ouvrir
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleTestOpen}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            🎉 Tester l’attribution d’une carte
          </button>
          {message && <p className="mt-2 text-sm text-white">{message}</p>}
        </div>

        <Footer />
      </main>
    </div>
  );
}