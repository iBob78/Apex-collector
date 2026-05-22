'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ajouterCarteAuJoueur } from '@/lib/actions/carte';
import { deductAP } from '@/lib/actions/profile';
import { updateQuestProgress } from '@/lib/actions/quests';
import { drawRarity, PACKS, PackConfig } from '@/lib/boosters';
import Card from '@/components/Card';
import SafeImage from '@/components/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';
import { AnyCard } from '@/types/game';

function OpenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packSlug = searchParams.get('pack') || 'common';
  const pack = PACKS[packSlug] || PACKS.common;

  const [userId, setUserId] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [drawnCards, setDrawnCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. AuthService Check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login');
      } else {
        setUserId(data.user.id);
        setLoading(false);
      }
    });
  }, [router]);

  // 2. Logic to Open Pack
  const handleOpenPack = async () => {
    if (!userId || isOpening) return;

    setIsOpening(true);

    try {
      // 1. Déduire les AP
      const deduction = await deductAP(userId, pack.price);

      if (!deduction.success) {
        alert(`Erreur: ${deduction.error}`);
        setIsOpening(false);
        return;
      }

      // 2. Procéder au tirage
      const cardCount = pack.cardCount;
      const raritiesToDraw = Array.from({ length: cardCount }, () => drawRarity(packSlug));

      // Tirage des cartes depuis Supabase
      const results: any[] = [];

      for (const rarity of raritiesToDraw) {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('rarity', rarity);

        if (error) throw error;

        if (data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          results.push(data[randomIndex]);
        }
      }

      // 3. Sauvegarde dans la collection du joueur
      await Promise.all(
        results.map(card => ajouterCarteAuJoueur(userId, (card as any).card_id || card.id, `pack_${packSlug}`))
      );

      setDrawnCards(results);

      // 4. Mettre à jour la progression des quêtes
      updateQuestProgress(userId, 'booster_open');

      // Vérifier les cibles de collection (ex: posséder une Icon)
      results.forEach(card => {
        updateQuestProgress(userId, 'collection_target', 1, { rarity: card.rarity });
      });

      // Délai pour l'animation de "déchirure" du pack
      setTimeout(() => {
        setIsRevealed(true);
      }, 1500);

    } catch (err) {
      console.error('Erreur lors de l\'ouverture du pack:', err);
      alert('Une erreur est survenue lors de l\'ouverture.');
      setIsOpening(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden flex flex-col items-center justify-center p-4 relative">

      {/* Background Ambience */}
      <div className={`absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60 z-0`}></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r ${pack.color} opacity-10 blur-[120px] rounded-full z-0`}></div>

      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="pack"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.div
              animate={isOpening ? {
                rotate: [0, -2, 2, -2, 2, 0],
                y: [0, -10, 0],
                scale: [1, 1.05, 1]
              } : {}}
              transition={{ repeat: isOpening ? Infinity : 0, duration: 0.4 }}
              className={`w-64 h-96 bg-gradient-to-br ${pack.color} rounded-2xl p-1 shadow-2xl shadow-black relative overflow-hidden group`}
            >
              {/* Pack Interior Design */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <div className="relative w-full h-full">
                  <SafeImage
                    src={pack.imageUrl}
                    alt={pack.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {pack.name}
                    </h2>
                    <div className="mt-4 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded text-[10px] tracking-[0.3em] font-bold uppercase">
                      {pack.cardCount} CARTES
                    </div>
                  </div>
                </div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </motion.div>

            {!isOpening && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleOpenPack}
                className="mt-12 px-12 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors tracking-widest uppercase text-sm"
              >
                Ouvrir maintenant
              </motion.button>
            )}

            {isOpening && (
              <p className="mt-8 text-blue-400 font-mono animate-pulse tracking-widest uppercase text-sm">
                Ouverture en cours...
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-6xl z-10 flex flex-col items-center"
          >
            <header className="mb-12 text-center">
              <motion.h2
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent"
              >
                Pack ouvert avec succès !
              </motion.h2>
              <p className="text-gray-500 mt-2">Voice les cartes ajoutées à votre collection.</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
              {drawnCards.map((card, idx) => (
                <motion.div
                  key={`${card.id}-${idx}`}
                  initial={{ rotateY: 90, opacity: 0, scale: 0.5 }}
                  animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + (idx * 0.15), type: 'spring', damping: 15 }}
                >
                  <Card {...card} owned={true} rarity={card.rarity} count={1} showLevel={false} />
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              onClick={() => router.push('/boosters')}
              className="px-8 py-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors"
            >
              Retour à la boutique
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OpenBoosterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <OpenContent />
    </Suspense>
  );
}