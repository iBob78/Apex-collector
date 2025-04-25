import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import styles from "./BoosterOpeningAnimation.module.css";

interface CardPosition {
  rotateX: number;
  rotateY: number;
  brightness: number;
  gradientX: number;
  gradientY: number;
}

interface CardEffect {
  type: "normal" | "holographic" | "shiny" | "ultra";
  colors: string[];
  intensity: number;
}

interface BoosterOpeningAnimationProps {
  booster: {
    imageUrl: string;
  };
  isOpen: boolean;
  onAnimationComplete: (cards: string[]) => void;
}

const CARD_EFFECTS: Record<string, CardEffect> = {
  normal: {
    type: "normal",
    colors: ["#ffffff"],
    intensity: 0.2
  },
  holographic: {
    type: "holographic",
    colors: [
      "#ff0000", "#ff7f00", "#ffff00", "#00ff00",
      "#0000ff", "#4b0082", "#8f00ff"
    ],
    intensity: 0.8
  },
  shiny: {
    type: "shiny",
    colors: ["#ffd700", "#ffffff"],
    intensity: 0.6
  },
  ultra: {
    type: "ultra",
    colors: ["#ffd700", "#ff0000", "#00ff00", "#0000ff", "#ffffff"],
    intensity: 1
  }
};

const BoosterOpeningAnimation: React.FC<BoosterOpeningAnimationProps> = ({
  booster,
  isOpen,
  onAnimationComplete
}) => {
  const [animationState, setAnimationState] = useState<"initial" | "shaking" | "opening" | "revealing">("initial");
  const [revealedCards, setRevealedCards] = useState<string[]>([]);
  const [cardPositions, setCardPositions] = useState<Record<number, CardPosition>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Mémoriser le tableau mockCards
  const mockCards = useMemo(() => [
    "/images/cards/card1.jpg",
    "/images/cards/card2.jpg",
    "/images/cards/card3.jpg",
    "/images/cards/card4.jpg",
    "/images/cards/card5.jpg"
  ], []);

  // Calculer la position 3D de la carte
  const calculateCardPosition = useCallback((e: MouseEvent, cardElement: HTMLElement) => {
    if (!containerRef.current) return null;

    const rect = cardElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const deltaX = (mouseX - centerX) / (rect.width / 2);
    const deltaY = (mouseY - centerY) / (rect.height / 2);

    const rotateY = Math.min(Math.max(deltaX * 20, -20), 20);
    const rotateX = Math.min(Math.max(-deltaY * 20, -20), 20);

    const brightness = 1 + (Math.abs(deltaX) + Math.abs(deltaY)) * 0.3;
    const gradientX = 50 + deltaX * 50;
    const gradientY = 50 + deltaY * 50;

    return { rotateX, rotateY, brightness, gradientX, gradientY };
  }, []);

  // Gestionnaire de mouvement de souris
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const cards = containerRef.current.getElementsByClassName(styles.card);
    const newPositions: Record<number, CardPosition> = {};

    Array.from(cards).forEach((card, index) => {
      const position = calculateCardPosition(e, card as HTMLElement);
      if (position) {
        newPositions[index] = position;
      }
    });

    setCardPositions(newPositions);
  }, [calculateCardPosition]);

  // Gérer les événements de souris
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  // Animation initiale
  useEffect(() => {
    if (isOpen) {
      const startAnimation = async () => {
        setAnimationState("shaking");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setAnimationState("opening");
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setAnimationState("revealing");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        for (const card of mockCards) {
          setRevealedCards(prev => [...prev, card]);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        onAnimationComplete(mockCards);
      };

      startAnimation();
    }
  }, [isOpen, mockCards, onAnimationComplete]);

  // Style des cartes avec effets
  const getCardStyle = (index: number, effect: CardEffect) => {
    const position = cardPositions[index] || {
      rotateX: 0,
      rotateY: 0,
      brightness: 1,
      gradientX: 50,
      gradientY: 50
    };

    const baseStyle = {
      transform: `
        perspective(1000px)
        rotateX(${position.rotateX}deg)
        rotateY(${position.rotateY}deg)
        scale3d(1, 1, 1)
      `,
      filter: `brightness(${position.brightness})`,
    };

    if (effect.type === "holographic") {
      return {
        ...baseStyle,
        background: `
          linear-gradient(
            ${position.rotateY}deg,
            ${effect.colors.map((color, i) => 
              `${color} ${(i * 100) / effect.colors.length}%`
            ).join(", ")}
          )
        `,
        opacity: effect.intensity,
      };
    }

    if (effect.type === "shiny") {
      return {
        ...baseStyle,
        background: `
          radial-gradient(
            circle at ${position.gradientX}% ${position.gradientY}%,
            ${effect.colors[0]} 0%,
            ${effect.colors[1]} 50%,
            transparent 100%
          )
        `,
        opacity: effect.intensity,
      };
    }

    return baseStyle;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.animationContainer} ref={containerRef}>
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
              <div 
                className={styles.cardEffect} 
                style={getCardStyle(index, CARD_EFFECTS.holographic)}
              />
              <div 
                className={styles.cardEffect} 
                style={getCardStyle(index, CARD_EFFECTS.shiny)}
              />
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
