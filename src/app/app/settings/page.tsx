'use client';

import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    const stored = localStorage.getItem('apex-lang');
    if (stored) setLang(stored);
  }, []);

  const handleChangeLang = () => {
    localStorage.setItem('apex-lang', lang);
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <h1 className="text-3xl font-bold">Réglages</h1>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Langue</h2>
          <select
            className="bg-gray-800 text-white p-2 rounded"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
          <button
            className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700 transition"
            onClick={handleChangeLang}
          >
            Appliquer la langue
          </button>
        </section>

        <Footer />
      </main>
    </div>
  );
}