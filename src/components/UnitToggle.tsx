'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function UnitToggle() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (loading) return;
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
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">km/h</span>

      <button
        onClick={toggleUnit}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 
        ${unit === 'imperial' ? 'bg-blue-600' : 'bg-gray-400'} disabled:opacity-50`}
        disabled={loading}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
          ${unit === 'imperial' ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>

      <span className="text-sm text-gray-500">mph</span>
    </div>
  );
}
