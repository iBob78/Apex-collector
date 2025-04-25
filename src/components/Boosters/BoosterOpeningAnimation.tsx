import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { BoosterType } from "@/types/boosters";
import Image from "next/image";
import styles from "./BoosterOpeningAnimation.module.css";

interface Particle {
  x: number;
  y: number;
  speed: number;
  angle: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
}

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  
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

  // Initialiser le canvas et les particules
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const createParticles = useCallback((x: number, y: number, count: number, isEpic = false) => {
    const particles: Particle[] = [];
    const colors = isEpic 
      ? ["#ffd700", "#ffa500", "#ff4500", "#ffffff"] 
      : ["#ffffff", "#f0f0f0", "#e0e0e0"];

    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        speed: Math.random() * 5 + 2,
        angle: Math.random() * Math.PI * 2,
        size: Math.random() * (isEpic ? 8 : 4) + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        rotation: Math.random() * Math.PI * 2
      });
    }

    particlesRef.current = [...particlesRef.current, ...particles];
  }, []);

  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += Math.cos(particle.angle) * particle.speed;
      particle.y += Math.sin(particle.angle) * particle.speed;
      particle.opacity -= 0.02;
      particle.rotation += 0.1;

      if (particle.opacity <= 0) return false;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      if (Math.random() > 0.5) {
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      } else {
        const size = particle.size;
        ctx.moveTo(-size, -size);
        ctx.lineTo(size, -size);
        ctx.lineTo(size, size);
        ctx.lineTo(-size, size);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      return true;
    });

    if (particlesRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    }
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
    createParticles(window.innerWidth / 2, window.innerHeight / 2, 20);
    animateParticles();
    await delay(2000);
    
    // Animation d'ouverture
    setAnimationState("opening");
    await playSound(openSound.current);
    createParticles(window.innerWidth / 2, window.innerHeight / 2, 50);
    await delay(1500);
    
    // Début de la révélation
    setAnimationState("revealing");
    await delay(500);
    
    // Révéler les cartes une par une
    for (let i = 0; i < mockCards.length; i++) {
      setRevealedCards(prev => [...prev, mockCards[i]]);
      if (i === mockCards.length - 1) {
        await playSound(epicRevealSound.current);
        createParticles(window.innerWidth / 2, window.innerHeight / 2, 100, true);
      } else {
        await playSound(revealSound.current);
        createParticles(window.innerWidth / 2, window.innerHeight / 2, 30);
      }
      await delay(800);
    }
    
    await delay(1000);
    onAnimationComplete(mockCards);
  }, [mockCards, onAnimationComplete, createParticles, animateParticles]);

  useEffect(() => {
    if (isOpen) {
      startAnimation();
    }
  }, [isOpen, startAnimation]);

  if (!isOpen) return null;

  return (
    <div className={styles.animationContainer}>
      <canvas 
        ref={canvasRef}
        className={styles.particleCanvas}
      />
      
      {animationState === "initial" && (
        <div className={styles.boosterPackage}>
          <div className={styles.shine} />
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
          <div className={styles.shine} />
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
          <div className={styles.shine} />
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
              <div className={styles.shine} />
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
