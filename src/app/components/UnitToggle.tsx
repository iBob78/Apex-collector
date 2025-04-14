'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function UnitToggle() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupère la préférence actuelle à la connexion
    const fetchPreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('unit_preference')
        .eq('id', user.id)
        .single();

      if (!error && data?.unit_preference) {
        setUnit(data.unit_preference);
      }

      setLoading(false);
    };

    fetchPreference();
  }, []);

  const toggleUnit = async () => {
    setLoading(true);
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ unit_preference: newUnit })
      .eq('id', user.id);

    if (!error) {
      setUnit(newUnit);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleUnit}
      disabled={loading}
      className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition"
    >
      {loading ? 'Chargement...' : `Unité : ${unit === 'metric' ? 'km/h' : 'mph'}`}
    </button>
  );
}
