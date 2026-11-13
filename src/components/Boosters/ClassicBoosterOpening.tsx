'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Volume2, VolumeX } from 'lucide-react';
import Card from '@/components/Card';
import SafeImage from '@/components/SafeImage';
import { useSitePreferences } from '@/contexts/SitePreferencesContext';
import { getRarityColor } from '@/lib/rarity';
import type { PackConfig } from '@/lib/boosters';
import styles from './ClassicBoosterOpening.module.css';

type Phase = 'sealed' | 'tearing' | 'burst' | 'cards';

interface ClassicBoosterOpeningProps {
  pack: PackConfig;
  packDisplayName: string;
  cardCount: number;
  isPrepared: boolean;
  isOpening: boolean;
  freeBoosterError: string | null;
  isFreeBooster: boolean;
  purchaseDisabled: boolean;
  drawnCards: any[];
  firstTimeCardIndices: Set<number>;
  discoverySaveError: string | null;
  boosterStatsSaveError: string | null;
  onOpen: () => Promise<void>;
  onBack: () => void;
}

const PACK_ACCENTS: Record<string, string> = {
  welcome: '#e6ac55',
  common: '#4f98ff',
  uncommon: '#2ac9a0',
  rare: '#b87cfa',
  ultrarare: '#e6b860',
  prototype: '#eb758f',
  mythic: '#bf9dff',
  legend: '#e9b95f',
  carbon: '#e8edf5',
};

const packAccent = (slug: string) => PACK_ACCENTS[slug] || '#7eaaff';
const isSpecial = (rarity: string) => ['Epic', 'Legend', 'Legendary', 'Icon', 'Mythic'].includes(rarity);

export default function ClassicBoosterOpening({
  pack,
  packDisplayName,
  cardCount,
  isPrepared,
  isOpening,
  freeBoosterError,
  isFreeBooster,
  purchaseDisabled,
  drawnCards,
  firstTimeCardIndices,
  discoverySaveError,
  boosterStatsSaveError,
  onOpen,
  onBack,
}: ClassicBoosterOpeningProps) {
  const { t } = useSitePreferences();
  const [phase, setPhase] = useState<Phase>('sealed');
  const [tearProgress, setTearProgress] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(() => new Set());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [useCompactPhoneCards, setUseCompactPhoneCards] = useState(false);
  const tearStartX = useRef<number | null>(null);
  const tearProgressRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const sync = () => setUseCompactPhoneCards(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    audioContext.current?.close().catch(() => undefined);
  }, []);

  const beep = (frequency = 450, duration = 0.055, wave: OscillatorType = 'triangle') => {
    if (!soundEnabled) return;
    try {
      const context = audioContext.current || new AudioContext();
      audioContext.current = context;
      void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.009);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration + 0.01);
    } catch {
      // Son facultatif : la révélation ne doit jamais dépendre de l'audio.
    }
  };

  const clearOpenTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const showCards = () => {
    clearOpenTimers();
    setPhase('cards');
  };

  const tearPack = () => {
    if (!isPrepared || phase !== 'sealed') return;
    tearStartX.current = null;
    tearProgressRef.current = 1;
    setTearProgress(1);
    setPhase('tearing');
    beep(350, 0.1, 'sawtooth');
    timers.current.push(setTimeout(() => setPhase('burst'), 320));
    timers.current.push(setTimeout(() => setPhase('cards'), 1060));
  };

  const onTearPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isPrepared || phase !== 'sealed') return;
    tearStartX.current = event.clientX;
    tearProgressRef.current = 0;
    setTearProgress(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onTearPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (tearStartX.current === null || !isPrepared || phase !== 'sealed') return;
    const width = event.currentTarget.getBoundingClientRect().width;
    const progress = Math.max(0, Math.min(1, (event.clientX - tearStartX.current) / Math.max(width - 46, 1)));
    tearProgressRef.current = progress;
    setTearProgress(progress);
  };

  const endTear = () => {
    if (tearStartX.current === null) return;
    tearStartX.current = null;
    if (tearProgressRef.current >= 0.78) {
      tearPack();
    } else {
      tearProgressRef.current = 0;
      setTearProgress(0);
    }
  };

  const flipCard = (index: number) => {
    if (flippedCards.has(index)) return;
    const rarity = String(drawnCards[index]?.rarity || 'Common');
    beep(isSpecial(rarity) ? 710 : 490, 0.075);
    setFlippedCards((current) => new Set(current).add(index));
  };

  const flipAll = () => {
    beep(590, 0.065);
    setFlippedCards(new Set(drawnCards.map((_, index) => index)));
  };

  const accent = packAccent(pack.slug);
  const complete = drawnCards.length > 0 && flippedCards.size === drawnCards.length;
  const ready = isPrepared && phase === 'sealed';
  const revealed = phase === 'cards';
  const packVars = { '--pack-accent': accent, '--tear-progress': tearProgress } as CSSProperties;

  return (
    <main className={styles.root} style={packVars}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.container}>
        <header className={styles.topbar}>
          <button type="button" className={styles.back} onClick={onBack}>
            <ArrowLeft size={16} aria-hidden="true" /> {t('Retour à la boutique')}
          </button>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>A</span>
            <span><strong>APEX COLLECTOR</strong><small>PREMIUM OPENING EXPERIENCE</small></span>
          </div>
          <button
            type="button"
            className={styles.sound}
            onClick={() => setSoundEnabled((value) => !value)}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? t('Désactiver le son') : t('Activer le son')}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </header>

        <div className={styles.headline}>
          <span className={styles.eyebrow}>APEX CLASSIC / EDITION V3</span>
          <h1>{packDisplayName}</h1>
          <p>{!revealed
            ? t('Chaque ouverture réserve une découverte.')
            : t('Tes cartes sont là !')}</p>
        </div>

        <div className={styles.steps} aria-label={t('Progression de l’ouverture')}>
          <span className={!isPrepared ? styles.stepActive : styles.stepDone}>
            <i>{isPrepared ? <Check size={11} /> : '01'}</i>{t('Préparer')}
          </span>
          <b aria-hidden="true" />
          <span className={!isPrepared ? '' : !revealed ? styles.stepActive : styles.stepDone}>
            <i>{revealed ? <Check size={11} /> : '02'}</i>{t('Ouvrir')}
          </span>
          <b aria-hidden="true" />
          <span className={revealed ? styles.stepActive : ''}>
            <i>03</i>{t('Découvrir')}
          </span>
        </div>

        {!revealed ? (
          <section className={styles.openingStage} aria-label={t('Ouverture du booster')}>
            <div className={styles.stageRings} aria-hidden="true" />
            <div className={styles.floorLight} aria-hidden="true" />
            <div className={[styles.packFloat, phase === 'tearing' ? styles.tearing : '', phase === 'burst' ? styles.burst : ''].join(' ')}>
              <div className={styles.pack}>
                <div className={styles.foilGrain} aria-hidden="true" />
                <div className={styles.sideSeams} aria-hidden="true" />
                <div className={styles.packImage}>
                  <SafeImage src={pack.imageUrl} alt="" fill className="object-cover" />
                  <div className={styles.imageShade} />
                </div>
                <div className={styles.packGraphic} aria-hidden="true" />
                <span className={styles.packMark}>A<span>PEX</span></span>
                <span className={styles.packCaption}>COLLECTOR SERIES</span>
                <span className={styles.packName}>{packDisplayName}</span>
                <span className={styles.packCount}>{cardCount} {t('Cartes')} <span aria-hidden="true">◆</span> SERIES 01</span>
                <span className={styles.packSerial} aria-hidden="true">AC • 026 / PREMIUM EDITION</span>
                <span className={styles.ridgeTop} aria-hidden="true" />
                <span className={styles.ridgeBottom} aria-hidden="true" />
                <span className={styles.foilShine} aria-hidden="true" />
                <div className={styles.flap} aria-hidden="true">
                  <span className={styles.flapRidge} />
                </div>
                {ready && (
                  <div className={styles.tearControl}>
                    <div className={styles.tearPerforation} aria-hidden="true" />
                    <div className={styles.tearFill} style={{ width: `${tearProgress * 100}%` }} aria-hidden="true" />
                    <button
                      type="button"
                      className={styles.tearTrack}
                      aria-label={t('Faire glisser de gauche à droite pour déchirer le booster')}
                      onPointerDown={onTearPointerDown}
                      onPointerMove={onTearPointerMove}
                      onPointerUp={endTear}
                      onPointerCancel={endTear}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          tearPack();
                        }
                      }}
                    >
                      <span className={styles.tearHandle} style={{ left: `calc(${tearProgress * 100}% - ${tearProgress * 46}px)` }} aria-hidden="true">
                        <span>››</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {phase === 'burst' && (
              <div className={styles.flyCards} aria-hidden="true">
                {Array.from({ length: Math.min(cardCount, 10) }, (_, index) => (
                  <span key={index} style={{ '--i': index, '--fan': index - (Math.min(cardCount, 10) - 1) / 2 } as CSSProperties}>A</span>
                ))}
              </div>
            )}

            <div className={styles.openControls}>
              {!isPrepared && (
                <>
                  {isFreeBooster && <p className={styles.freeNotice}>{t('Booster offert : aucune dépense d’AC ne sera effectuée.')}</p>}
                  {freeBoosterError && <p className={styles.error} role="alert">{freeBoosterError}</p>}
                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={isOpening || purchaseDisabled}
                    onClick={() => void onOpen()}
                  >
                    {isOpening ? t('Ouverture en cours...') : t('Ouvrir le booster')}
                  </button>
                  {!isOpening && !freeBoosterError && <p className={styles.hint}>{t('Une fois le booster préparé, déchire la partie supérieure.')}</p>}
                </>
              )}
              {ready && (
                <>
                  <p className={styles.tearInstruction}>{t('Attrape la languette et fais-la glisser jusqu’au bord droit.')}</p>
                  <button type="button" className={styles.minorButton} onClick={tearPack}>
                    {t('Déchirer le booster')}
                  </button>
                </>
              )}
              {isPrepared && (phase === 'tearing' || phase === 'burst') && <p className={styles.tearInstruction}>{t('Ouverture du booster…')}</p>}
              {isPrepared && <button type="button" className={styles.skip} onClick={showCards}>{t('Passer l’animation')}</button>}
            </div>
          </section>
        ) : (
          <section className={styles.results} aria-label={t('Cartes du booster')}>
            <div className={styles.resultHead}>
              <div>
                <span className={styles.resultEyebrow}>COLLECTION / {cardCount} {t('Cartes')}</span>
                <h2>{t('Tes cartes sont là !')}</h2>
                <p>{complete ? t('Toutes les cartes sont révélées.') : t('Clique sur une carte pour la retourner, ou révèle-les toutes.')}</p>
              </div>
              <div className={styles.resultActions}>
                <span className={styles.counter}>{flippedCards.size} / {drawnCards.length} {t('révélées')}</span>
                <button type="button" className={styles.revealButton} disabled={complete} onClick={flipAll}>
                  {complete ? t('Toutes révélées') : t('Retourner toutes les cartes')}
                </button>
              </div>
            </div>

            {discoverySaveError && <p className={styles.error} role="alert">{discoverySaveError}</p>}
            {boosterStatsSaveError && <p className={styles.error} role="alert">{boosterStatsSaveError}</p>}

            <div className={styles.cardGrid}>
              {drawnCards.map((card, index) => {
                const rarity = String(card.rarity || 'Common');
                const rarityColor = getRarityColor(rarity);
                const faceUp = flippedCards.has(index);
                const rarityVars = { '--rarity-color': rarityColor, '--i': index } as CSSProperties;
                return (
                  <div
                    key={`${card.category || 'card'}-${card.card_id || card.circuit_id || card.driver_id || card.id || index}-${index}`}
                    className={`${styles.cardSlot} ${faceUp ? styles.faceUp : ''} ${isSpecial(rarity) ? styles.special : ''}`}
                    style={rarityVars}
                  >
                    <div className={styles.rarityHalo} aria-hidden="true" />
                    <motion.div
                      className={styles.flipInner}
                      animate={{ rotateY: faceUp ? 180 : 0 }}
                      transition={{ duration: 0.63, ease: [0.2, 0.85, 0.18, 1] }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <button
                        type="button"
                        disabled={faceUp}
                        onClick={() => flipCard(index)}
                        className={styles.cardBack}
                        aria-label={t('Retourner la carte {number}', { number: index + 1 })}
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <span className={styles.backBorder} aria-hidden="true" />
                        <span className={styles.backMark} aria-hidden="true">A<small>APEX COLLECTOR</small></span>
                        <span className={styles.backSerial} aria-hidden="true">PREMIUM SERIES / 01</span>
                        <span className={styles.backHint} aria-hidden="true">{t('Cliquez pour révéler')}</span>
                      </button>
                      <div className={styles.cardFront} style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                        <Card
                          {...card}
                          owned={true}
                          rarity={card.rarity}
                          count={1}
                          showLevel={false}
                          compact
                          mobileGrid={useCompactPhoneCards}
                          boosterReveal
                          className="h-full"
                        />
                        {firstTimeCardIndices.has(index) && <span className={styles.newBadge} aria-label={t('Nouvelle Carte')}>NEW!</span>}
                        {isSpecial(rarity) && <span className={styles.prism} aria-hidden="true" />}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <div className={styles.resultsFooter}>
              <p>{t('Chaque carte révélée rejoint votre collection.')}</p>
              <button type="button" className={styles.primaryButton} onClick={onBack}>{t('Retour à la boutique')}</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
