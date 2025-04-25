import React, { useState, useCallback, useEffect } from "react";
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

  // Simuler l'obtention des cartes - à remplacer par une vraie API call
  const mockCards = [
    "/images/cards/card1.jpg",
    "/images/cards/card2.jpg",
    "/images/cards/card3.jpg",
    "/images/cards/card4.jpg",
    "/images/cards/card5.jpg"
  ];

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startAnimation = useCallback(async () => {
    setAnimationState("shaking");
    await delay(2000);
    
    setAnimationState("opening");
    await delay(1500);
    
    setAnimationState("revealing");
    await delay(500);
    
    // Révéler les cartes une par une
    for (let i = 0; i < mockCards.length; i++) {
      setRevealedCards(prev => [...prev, mockCards[i]]);
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
