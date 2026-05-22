'use client';

import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { TrophyIcon, StarIcon, CheckCircle2Icon, LockIcon } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 1, title: 'Premières Roues', desc: 'Posséder votre premier véhicule.', date: '12 Déc 2025', unlocked: true, icon: '🚗' },
  { id: 2, title: 'Chasseur de Légendes', desc: 'Obtenir une carte de rareté Legend.', date: '15 Déc 2025', unlocked: true, icon: '💎' },
  { id: 3, title: 'Globe-Trotteur', desc: 'Débloquer 10 circuits différents.', date: '18 Déc 2025', unlocked: true, icon: '🌍' },
  { id: 4, title: 'Millionnaire', desc: 'Atteindre un solde de 1,000,000 Crédits.', unlocked: false, icon: '💰' },
  { id: 5, title: 'Garage Complet', desc: 'Posséder au moins un exemplaire de chaque modèle.', unlocked: false, icon: '🏠' },
  { id: 6, title: 'Accroc à la Boutique', desc: 'Ouvrir plus de 100 boosters.', unlocked: false, icon: '🎁' },
];

export default function AchievementsPage() {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="p-4 md:p-12 flex-1">
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Centre des Succès
            </h1>
            <p className="text-gray-500 font-mono text-sm mt-1">
              Suivez votre progression et vos exploits sur la piste.
            </p>
          </header>

          {/* Progress Overview */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/5 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <TrophyIcon size={120} className="text-blue-500" />
            </div>

            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full border-8 border-blue-500/20 border-t-blue-500 flex items-center justify-center mb-0 md:mb-0">
                <span className="text-2xl font-black italic">50%</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Maître de Collection</h2>
              <p className="text-gray-400 text-sm max-w-md">Continuez à débloquer des succès pour obtenir des récompenses exclusives et monter dans le classement mondial des pilotes.</p>
              <div className="mt-4 flex gap-4 text-[10px] font-black uppercase tracking-widest text-blue-400">
                <span>3 / 6 SUCCÈS DÉBLOQUÉS</span>
                <span className="text-gray-600">|</span>
                <span>RANG: PILOTE AMATEUR</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACHIEVEMENTS.map((ach, idx) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-6 rounded-3xl border transition-all overflow-hidden group ${ach.unlocked
                    ? 'bg-blue-500/5 border-white/10'
                    : 'bg-black border-white/5 grayscale pointer-events-none opacity-40'
                  }`}
              >
                {/* Background Pattern */}
                <div className="absolute -top-4 -right-4 text-6xl opacity-10 select-none group-hover:scale-125 transition-transform duration-500">
                  {ach.icon}
                </div>

                <div className="flex items-start justify-between relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-2xl ${ach.unlocked ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-white/5'
                    }`}>
                    {ach.icon}
                  </div>
                  <div>
                    {ach.unlocked ? (
                      <CheckCircle2Icon className="text-blue-500" size={20} />
                    ) : (
                      <LockIcon className="text-gray-700" size={20} />
                    )}
                  </div>
                </div>

                <div className="mt-6 relative z-10">
                  <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none mb-2">
                    {ach.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {ach.desc}
                  </p>
                </div>

                {ach.unlocked && (
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-600 uppercase italic">Débloqué le {ach.date}</span>
                    <div className="flex items-center gap-1 text-[10px] text-blue-400 font-black">
                      <StarIcon size={10} fill="currentColor" />
                      <span>+100 XP</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}