'use client';

import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { SiteLanguage, UnitSystem } from '@/lib/preferences';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';

export default function SettingsPage() {
  const { language, units, saveLanguage, saveUnits, t } = useSitePreferences();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; key: string; detail?: string } | null>(null);

  const updatePreference = async (save: () => Promise<string | null>) => {
    setSaving(true);
    setStatus(null);
    const error = await save();
    setStatus(error
      ? { type: 'error', key: 'Impossible d’enregistrer la préférence.', detail: error }
      : { type: 'success', key: 'Préférences enregistrées.' });
    setSaving(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">{t('Réglages')}</h1>
          <p className="text-sm text-gray-400">{t('Les préférences sont enregistrées sur votre profil.')}</p>
        </header>

        <section className="max-w-2xl space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="space-y-2">
            <label htmlFor="site-language" className="block text-sm font-semibold">{t('Langue')}</label>
            <select
              id="site-language"
              className="w-full rounded-lg border border-white/10 bg-gray-800 p-3 text-white"
              value={language}
              disabled={saving}
              onChange={(event) => {
                const nextLanguage = event.target.value as SiteLanguage;
                void updatePreference(() => saveLanguage(nextLanguage));
              }}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="unit-system" className="block text-sm font-semibold">{t('Unités')}</label>
            <select
              id="unit-system"
              className="w-full rounded-lg border border-white/10 bg-gray-800 p-3 text-white"
              value={units}
              disabled={saving}
              onChange={(event) => {
                const nextUnits = event.target.value as UnitSystem;
                void updatePreference(() => saveUnits(nextUnits));
              }}
            >
              <option value="metric">{t('Métriques')} (km/h, kW, Nm, kg)</option>
              <option value="imperial">{t('Impériales')} (mph, HP, lb-ft, lb)</option>
            </select>
          </div>

          <div aria-live="polite" className="min-h-5 text-sm">
            {saving && <span className="text-gray-400">{t('Enregistrement…')}</span>}
            {!saving && status && (
              <span className={status.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                {t(status.key)} {status.detail}
              </span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}