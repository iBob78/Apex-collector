import React from "react";
import Image from "next/image";
import styles from "./BoosterOpeningAnimation.module.css";

enum CardRarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary"
}

interface Card {
  id: string;
  imageUrl: string;
  rarity: CardRarity;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  angle: number;
  size: number;
  color: string;
  opacity: number;
  lifetime: number;
  currentLife: number;
}

interface RarityEffect {
  particles: {
    count: number;
    colors: string[];
    size: number;
    speed: number;
    lifetime: number;
  };
  visual: {
    glow: string;
    intensity: number;
    rotation: number;
  };
}

const RARITY_EFFECTS: Record<CardRarity, RarityEffect> = {
  [CardRarity.COMMON]: {
    particles: {
      count: 20,
      colors: ["#ffffff", "#e0e0e0"],
      size: 3,
      speed: 2,
      lifetime: 1
    },
    visual: {
      glow: "#ffffff",
      intensity: 0.2,
      rotation: 5
    }
  },
  [CardRarity.UNCOMMON]: {
    particles: {
      count: 30,
      colors: ["#00ff00", "#ffffff"],
      size: 4,
      speed: 3,
      lifetime: 1.5
    },
    visual: {
      glow: "#00ff00",
      intensity: 0.4,
      rotation: 10
    }
  },
  [CardRarity.RARE]: {
    particles: {
      count: 50,
      colors: ["#0000ff", "#ffffff", "#00ffff"],
      size: 5,
      speed: 4,
      lifetime: 2
    },
    visual: {
      glow: "#0000ff",
      intensity: 0.6,
      rotation: 15
    }
  },
  [CardRarity.EPIC]: {
    particles: {
      count: 80,
      colors: ["#ff00ff", "#ff69b4", "#ffffff"],
      size: 6,
      speed: 5,
      lifetime: 2.5
    },
    visual: {
      glow: "#ff00ff",
      intensity: 0.8,
      rotation: 20
    }
  },
  [CardRarity.LEGENDARY]: {
    particles: {
      count: 120,
      colors: ["#ffd700", "#ff4500", "#ffffff", "#ff0000"],
      size: 8,
      speed: 6,
      lifetime: 3
    },
    visual: {
      glow: "#ffd700",
      intensity: 1,
      rotation: 25
    }
  }
};

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
  const [particles, setParticles] = React.useState<Particle[]>([]);
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationFrameRef = React.useRef<number>();

  // Optimisation des particules avec useCallback
  const createParticlesForRarity = React.useCallback((x: number, y: number, rarity: CardRarity) => {
    const effect = RARITY_EFFECTS[rarity].particles;
    const newParticles: Particle[] = Array.from({ length: effect.count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * effect.speed + effect.speed / 2;
      return {
        x,
        y,
        speed,
        angle,
        size: Math.random() * effect.size + effect.size / 2,
        color: effect.colors[Math.floor(Math.random() * effect.colors.length)],
        opacity: 1,
        lifetime: effect.lifetime,
        currentLife: 0
      };
    });

    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Animation optimisée des particules
  React.useEffect(() => {
    if (particles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Ajustement de la taille du canvas
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + Math.cos(particle.angle) * particle.speed,
            y: particle.y + Math.sin(particle.angle) * particle.speed,
            currentLife: particle.currentLife + 1/60,
            opacity: 1 - (particle.currentLife / particle.lifetime)
          }))
          .filter(particle => particle.currentLife < particle.lifetime)
      );

      particles.forEach(particle => {
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles]);

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
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          createParticlesForRarity(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            card.rarity
          );
        }
        setRevealedCards(prev => [...prev, card.id]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAnimationComplete(booster.cards);
    };

    animate();
  }, [isOpen, booster.cards, onAnimationComplete, createParticlesForRarity]);

  if (!isOpen) return null;

  return (
    <div className={styles.animationContainer} ref={containerRef}>
      <canvas 
        className={styles.particleCanvas}
        ref={canvasRef}
      />
      
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
          {booster.cards.map((card, index) => {
            const rarityEffect = RARITY_EFFECTS[card.rarity];
            return (
              <div
                key={card.id}
                className={`
                  ${styles.card}
                  ${revealedCards.includes(card.id) ? styles.revealed : ""}
                `}
                style={{
                  transitionDelay: `${index * 0.8}s`,
                  "--glow-color": rarityEffect.visual.glow,
                  "--glow-intensity": rarityEffect.visual.intensity,
                  "--rotation-amount": `${rarityEffect.visual.rotation}deg`
                } as React.CSSProperties}
              >
                <Image
                  src={card.imageUrl}
                  alt={`Card ${index + 1}`}
                  width={200}
                  height={280}
                  priority
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BoosterOpeningAnimation;
