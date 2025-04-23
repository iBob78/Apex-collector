"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Correct
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UnitToggle from '@/components/UnitToggle';
import TachometerLoader from '@/components/TachometerLoader';

const supabase = createClientComponentClient();

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]); // ✅ Ajout de router dans les dépendances

  if (loading) return <TachometerLoader />;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      <p className="text-gray-500">Choisissez vos préférences d&apos;affichage :</p> {/* ✅ Correction de l'apostrophe */}

      <div>
        <h2 className="text-lg font-semibold mb-2">Unités</h2>
        <UnitToggle />
      </div>
    </main>
  );
}
