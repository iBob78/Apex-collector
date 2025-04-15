"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UnitToggle from '../components/UnitToggle';

const supabase = createClientComponentClient();

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Vérification si l'utilisateur est connecté
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login'); // Redirection vers la page de connexion si non connecté
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      <p className="text-gray-500">Choisissez vos préférences d'affichage :</p>

      <div>
        <h2 className="text-lg font-semibold mb-2">Unités</h2>
        <UnitToggle />
      </div>
    </main>
  );
}
