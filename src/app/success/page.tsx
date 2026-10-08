'use client';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function Success() {
  const { t } = useSitePreferences();
  return (
    <main className="flex flex-col items-center min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl mb-6 text-[#00B7EB] lowercase">{t('Succès débloqués')}</h2>
      <ul className="list-disc text-sm text-gray-300 space-y-2">
        <li>{t('Posséder 10 cartes – Booster offert')}</li>
        <li>{t('Premier booster ouvert')}</li>
        <li>{t('Accéder au marché')}</li>
      </ul>
    </main>
  );
}
