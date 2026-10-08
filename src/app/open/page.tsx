'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ajouterCarteAuJoueur, ajouterCircuitAuJoueur } from '@/lib/actions/carte';
import { deductAP } from '@/lib/actions/profile';
import { updateQuestProgress } from '@/lib/actions/quests';
import { drawBoosterCards, PACKS } from '@/lib/boosters';
import Card from '@/components/Card';
import SafeImage from '@/components/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';

function OpenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packSlug = searchParams.get('pack') || 'common';
  const pack = PACKS[packSlug] || PACKS.common;

  const [userId, setUserId] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isPrepared, setIsPrepared] = useState(false);
  const [isTorn, setIsTorn] = useState(false);
  const [tearProgress, setTearProgress] = useState(0);
  const [showCards, setShowCards] = useState(false);
  const [drawnCards, setDrawnCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const packRef = useRef<HTMLDivElement>(null);
  const tearStartX = useRef<number | null>(null);
  const tearProgressRef = useRef(0);

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
    if (!userId || isOpening || isPrepared) return;

    setIsOpening(true);

    try {
      // Charger les catalogues avant paiement évite de débiter si le tirage est impossible.
      const [vehiclesResult, circuitsResult] = await Promise.all([
        supabase.from('cards').select('*'),
        supabase.from('circuits').select('*')
      ]);

      if (vehiclesResult.error) throw vehiclesResult.error;
      if (circuitsResult.error) throw circuitsResult.error;

      const results = drawBoosterCards(
        packSlug,
        vehiclesResult.data || [],
        circuitsResult.data || [],
        pack.cardCount
      );

      // 1. Déduire les AP après avoir confirmé qu'un tirage est possible.
      const deduction = await deductAP(userId, pack.price);

      if (!deduction.success) {
        alert(`Erreur: ${deduction.error}`);
        setIsOpening(false);
        return;
      }

      // 2. Sauvegarde dans la collection du joueur
      await Promise.all(
        results.map(async (card) => {
          const isCircuit = (card.category === 'circuit') || (card.type === 'Circuit') || (card.track_name != null);
          const uniqueId = String((card as any).card_id || card.id);

          if (isCircuit) {
            return ajouterCircuitAuJoueur(userId, uniqueId);
          }

          return ajouterCarteAuJoueur(userId, uniqueId, `pack_${packSlug}`);
        })
      );

      setDrawnCards(results);

      // 3. Mettre à jour la progression des quêtes
      updateQuestProgress(userId, 'booster_open');

      // Vérifier les cibles de collection (ex: posséder une Icon)
      results.forEach(card => {
        updateQuestProgress(userId, 'collection_target', 1, { rarity: card.rarity ?? undefined });
      });

      // Délai pour l'animation de "déchirure" du pack
      setIsPrepared(true);
      setIsOpening(false);

    } catch (err) {
      console.error('Erreur lors de l\'ouverture du pack:', err);
      alert('Une erreur est survenue lors de l\'ouverture.');
      setIsOpening(false);
    }
  };

  const tearPack = () => {
    if (!isPrepared || isTorn) return;

    tearProgressRef.current = 1;
    setTearProgress(1);
    setIsTorn(true);
    window.setTimeout(() => setShowCards(true), 550);
  };

  const startTear = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isPrepared || isTorn) return;

    tearStartX.current = event.clientX;
    tearProgressRef.current = 0;
    setTearProgress(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveTear = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (tearStartX.current === null || !packRef.current) return;

    const packWidth = packRef.current.getBoundingClientRect().width;
    const progress = Math.max(0, Math.min(1, (event.clientX - tearStartX.current) / packWidth));
    tearProgressRef.current = progress;
    setTearProgress(progress);
  };

  const endTear = () => {
    if (tearStartX.current === null) return;

    tearStartX.current = null;
    if (tearProgressRef.current >= 0.82) {
      tearPack();
      return;
    }

    tearProgressRef.current = 0;
    setTearProgress(0);
  };

  const handleTearKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      tearPack();
    }
  };

  const flipCard = (index: number) => {
    setFlippedCards((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const flipAllCards = () => {
    setFlippedCards((current) =>
      current.size === drawnCards.length
        ? new Set()
        : new Set(drawnCards.map((_, index) => index))
    );
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden flex flex-col items-center justify-center p-4 relative">

      {/* Background Ambience */}
      <div className={`absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60 z-0`}></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r ${pack.color} opacity-10 blur-[120px] rounded-full z-0`}></div>

      <AnimatePresence mode="wait">
        {!showCards ? (
          <motion.div
            key="pack"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.div
              ref={packRef}
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

                  {!isPrepared && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <h2 className="text-3xl font-black tracking-tighter uppercase italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {pack.name}
                      </h2>
                      <div className="mt-4 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded text-[10px] tracking-[0.3em] font-bold uppercase">
                        {pack.cardCount} CARTES
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isPrepared && !isTorn && (
                <div
                  className="absolute inset-x-1 top-1 z-20 h-[26%] overflow-visible rounded-t-xl shadow-lg"
                >
                  <div className="absolute inset-0 overflow-hidden rounded-t-xl">
                    <div className="absolute inset-x-0 top-0 h-96">
                      <SafeImage
                        src={pack.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50" />
                    </div>
                    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
                        Déchirer de gauche à droite
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-[2px] w-full border-b border-dashed border-white/50" />
                  {tearProgress > 0 && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 left-0 h-2 translate-y-1/2 bg-gradient-to-r from-cyan-200 via-white to-cyan-200 shadow-[0_2px_10px_rgba(103,232,249,0.9)]"
                      style={{
                        width: `${tearProgress * 100}%`,
                        clipPath: 'polygon(0 45%, 8% 0, 16% 65%, 24% 20%, 33% 100%, 42% 30%, 51% 75%, 61% 10%, 70% 85%, 80% 25%, 90% 70%, 100% 35%, 100% 100%, 0 100%)',
                      }}
                    />
                  )}
                  {!isTorn && (
                    <button
                      type="button"
                      aria-label="Faire glisser de gauche à droite pour déchirer le booster"
                      onPointerDown={startTear}
                      onPointerMove={moveTear}
                      onPointerUp={endTear}
                      onPointerCancel={endTear}
                      onKeyDown={handleTearKeyDown}
                      className="absolute bottom-0 left-0 z-30 flex h-11 w-12 touch-none cursor-ew-resize items-center justify-center rounded-r-lg border border-cyan-200/70 bg-cyan-300/25 text-xl font-black text-white shadow-[0_0_18px_rgba(103,232,249,0.5)] active:bg-cyan-200/50"
                      style={{
                        transform: `translate(${tearProgress * Math.max(0, (packRef.current?.clientWidth ?? 256) - 48) - tearProgress * 72}px, -50%)`,
                      }}
                    >
                      <span aria-hidden="true">»</span>
                    </button>
                  )}
                </div>
              )}

              {/* Shine effect */}
              {!isPrepared && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
            </motion.div>

            {!isPrepared && !isOpening && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleOpenPack}
                className="mt-12 px-12 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors tracking-widest uppercase text-sm"
              >
                Ouvrir le booster
              </motion.button>
            )}

            {isOpening && (
              <p className="mt-8 text-blue-400 font-mono animate-pulse tracking-widest uppercase text-sm">
                Ouverture en cours...
              </p>
            )}

            {isPrepared && !isTorn && (
              <div className="mt-8 text-center">
                <p className="font-mono text-sm uppercase tracking-widest text-blue-300">
                  Attrape la languette et fais-la glisser jusqu’au bord droit.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-[1400px] z-10 flex flex-col items-center"
          >
            <header className="mb-8 text-center">
              <motion.h2
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent"
              >
                Tes cartes sont là !
              </motion.h2>
              <p className="mt-2 text-gray-500">Clique sur une carte pour la retourner, ou révèle-les toutes.</p>
            </header>

            <button
              type="button"
              onClick={flipAllCards}
              className="mb-8 rounded-full border border-blue-400/40 bg-blue-500/15 px-6 py-3 text-xs font-bold uppercase tracking-widest text-blue-200 transition hover:bg-blue-500/25"
            >
              {flippedCards.size === drawnCards.length
                ? 'Retourner les cartes face cachée'
                : 'Retourner toutes les cartes'}
            </button>

            <div className="mb-12 w-full max-w-[1400px]">
              <div className="flex flex-wrap items-stretch justify-center gap-4 px-2">
                {drawnCards.map((card, idx) => (
                  <motion.div
                    key={`${card.id}-${idx}`}
                    initial={{ y: 30, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1, type: 'spring', damping: 15 }}
                    className="w-[160px] shrink-0 sm:w-[180px] lg:w-[200px]"
                  >
                    <motion.div
                      animate={{ rotateY: flippedCards.has(idx) ? 180 : 0 }}
                      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="relative aspect-[2/3] w-full"
                    >
                      <button
                        type="button"
                        disabled={flippedCards.has(idx)}
                        tabIndex={flippedCards.has(idx) ? -1 : 0}
                        onClick={() => flipCard(idx)}
                        aria-label={`Retourner la carte ${idx + 1}`}
                        className="absolute inset-0 overflow-hidden rounded-xl border-2 border-white/30 bg-gradient-to-br from-slate-900 via-blue-950 to-black shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="absolute inset-2 rounded-lg border border-blue-300/40" />
                        <div className="absolute inset-4 rounded-lg border border-white/10" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.3),transparent_65%)]">
                          <span className="text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_0_18px_rgba(96,165,250,0.8)]">A</span>
                          <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.35em] text-blue-200/80">Apex Collector</span>
                        </div>
                        <span className="absolute bottom-3 left-0 right-0 text-center text-[8px] font-bold uppercase tracking-[0.3em] text-white/40">
                          Cliquez pour révéler
                        </span>
                      </button>
                      <div
                        className="absolute inset-0 overflow-hidden rounded-xl"
                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                      >
                        <Card
                          {...card}
                          owned={true}
                          rarity={card.rarity}
                          count={1}
                          showLevel={false}
                          compact
                          className="h-full"
                          onCardClick={() => flipCard(idx)}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
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