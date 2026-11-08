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
    <div className="apex-paddock flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 space-y-6 px-4 py-6 sm:px-8 sm:py-9">
        <header className="paddock-header space-y-2">
          <p className="paddock-eyebrow">APEX / GARAGE SETTINGS</p>
          <h1 className="paddock-title mt-3">{t('Réglages')}</h1>
          <p className="paddock-subtitle">{t('Les préférences sont enregistrées sur votre profil.')}</p>
        </header>

        <section className="paddock-panel max-w-2xl space-y-6 p-5 sm:p-7">
          <div className="space-y-2">
            <label htmlFor="site-language" className="block text-sm font-semibold">{t('Langue')}</label>
            <select
              id="site-language"
              className="paddock-field min-h-11 w-full rounded-lg p-3"
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
              className="paddock-field min-h-11 w-full rounded-lg p-3"
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