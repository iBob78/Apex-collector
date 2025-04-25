import React from "react";
import Image from "next/image";
import styles from "./BoosterOpeningAnimation.module.css";

interface Card {
  id: string;
  imageUrl: string;
}

interface BoosterOpeningAnimationProps {
  booster: {
    imageUrl: string;
    cards: Card[];
  };
  isOpen: boolean;
  onAnimationComplete: (cards: Card[]) => void;
}

const BoosterOpeningAnimation: React.FC<BoosterOpeningAnimationProps> = ({
  booster,
  isOpen,
  onAnimationComplete
}) => {
  const [animationState, setAnimationState] = React.useState<"initial" | "shaking" | "opening" | "revealing">("initial");
  const [revealedCards, setRevealedCards] = React.useState<string[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const animate = async () => {
      setAnimationState("shaking");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnimationState("opening");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnimationState("revealing");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      for (const card of booster.cards) {
        setRevealedCards(prev => [...prev, card.id]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAnimationComplete(booster.cards);
    };

    animate();
  }, [isOpen, booster.cards, onAnimationComplete]);

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
          {booster.cards.map((card, index) => (
            <div
              key={card.id}
              className={`
                ${styles.card}
                ${revealedCards.includes(card.id) ? styles.revealed : ""}
              `}
              style={{ transitionDelay: `${index * 0.8}s` }}
            >
              <Image
                src={card.imageUrl}
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
