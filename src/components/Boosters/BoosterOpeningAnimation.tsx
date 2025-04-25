import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { BoosterType } from "@/types/boosters";
import Image from "next/image";
import styles from "./BoosterOpeningAnimation.module.css";

interface BoosterOpeningAnimationProps {
  booster: BoosterType;
  isOpen: boolean;
  onAnimationComplete: (cards: string[]) => void;
}

const BoosterOpeningAnimation: React.FC<BoosterOpeningAnimationProps> = ({
  booster,
  isOpen,
  onAnimationComplete
}) => {
  const [animationState, setAnimationState] = useState<"initial" | "shaking" | "opening" | "revealing">("initial");
  const [revealedCards, setRevealedCards] = useState<string[]>([]);
  
  // Références audio
  const shakeSound = useRef<HTMLAudioElement | null>(null);
  const openSound = useRef<HTMLAudioElement | null>(null);
  const revealSound = useRef<HTMLAudioElement | null>(null);
  const epicRevealSound = useRef<HTMLAudioElement | null>(null);

  // Mémoriser le tableau mockCards pour éviter les re-rendus inutiles
  const mockCards = useMemo(() => [
    "/images/cards/card1.jpg",
    "/images/cards/card2.jpg",
    "/images/cards/card3.jpg",
    "/images/cards/card4.jpg",
    "/images/cards/card5.jpg"
  ], []);

  // Initialiser les sons
  useEffect(() => {
    shakeSound.current = new Audio("/sounds/shake.mp3");
    openSound.current = new Audio("/sounds/open.mp3");
    revealSound.current = new Audio("/sounds/reveal.mp3");
    epicRevealSound.current = new Audio("/sounds/epic-reveal.mp3");

    // Précharger les sons
    shakeSound.current.load();
    openSound.current.load();
    revealSound.current.load();
    epicRevealSound.current.load();

    return () => {
      // Nettoyer les références audio
      shakeSound.current = null;
      openSound.current = null;
      revealSound.current = null;
      epicRevealSound.current = null;
    };
  }, []);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const playSound = async (audio: HTMLAudioElement | null) => {
    if (audio) {
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    }
  };

  const startAnimation = useCallback(async () => {
    // Animation de secousse
    setAnimationState("shaking");
    await playSound(shakeSound.current);
    await delay(2000);
    
    // Animation d'ouverture
    setAnimationState("opening");
    await playSound(openSound.current);
    await delay(1500);
    
    // Début de la révélation
    setAnimationState("revealing");
    await delay(500);
    
    // Révéler les cartes une par une
    for (let i = 0; i < mockCards.length; i++) {
      setRevealedCards(prev => [...prev, mockCards[i]]);
      // Son épique pour la dernière carte
      if (i === mockCards.length - 1) {
        await playSound(epicRevealSound.current);
      } else {
        await playSound(revealSound.current);
      }
      await delay(800);
    }
    
    await delay(1000);
    onAnimationComplete(mockCards);
  }, [mockCards, onAnimationComplete]);

  useEffect(() => {
    if (isOpen) {
      startAnimation();
    }
  }, [isOpen, startAnimation]);

  if (!isOpen) return null;

  return (
    <div className={styles.animationContainer}>
      {animationState === "initial" && (
        <div className={styles.boosterPackage}>
          <Image
            src={booster.imageUrl}
            alt="Booster pack"
            width={300}
            height={450}
            priority
          />
        </div>
      )}
      
      {animationState === "shaking" && (
        <div className={`${styles.boosterPackage} ${styles.shake}`}>
          <Image
            src={booster.imageUrl}
            alt="Booster pack shaking"
            width={300}
            height={450}
            priority
          />
        </div>
      )}
      
      {animationState === "opening" && (
        <div className={`${styles.boosterPackage} ${styles.open}`}>
          <Image
            src={booster.imageUrl}
            alt="Booster pack opening"
            width={300}
            height={450}
            priority
          />
        </div>
      )}
      
      {animationState === "revealing" && (
        <div className={styles.cardsReveal}>
          {mockCards.map((card, index) => (
            <div
              key={index}
              className={`${styles.card} ${revealedCards.includes(card) ? styles.revealed : ""}`}
              style={{ transitionDelay: `${index * 0.8}s` }}
            >
              <Image
                src={card}
                alt={`Card ${index + 1}`}
                width={200}
                height={280}
                priority
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoosterOpeningAnimation;
