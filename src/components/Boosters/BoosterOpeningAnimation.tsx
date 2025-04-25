import React from "react";
import Image from "next/image";
import styles from "./BoosterOpeningAnimation.module.css";

// ... (interfaces et configurations précédentes)

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

  // Animation principale
  React.useEffect(() => {
    if (!isOpen) {
      setAnimationState("initial");
      setRevealedCards([]);
      setParticles([]);
      return;
    }

    let mounted = true;

    const animate = async () => {
      if (!mounted) return;

      // Phase de secousse
      setAnimationState("shaking");
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (!mounted) return;
      
      // Phase d'ouverture
      setAnimationState("opening");
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!mounted) return;
      
      // Phase de révélation
      setAnimationState("revealing");
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!mounted) return;
      
      // Révélation des cartes une par une
      for (const card of booster.cards) {
        if (!mounted) return;

        // Création des particules pour la carte
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const effect = RARITY_EFFECTS[card.rarity].particles;
          const newParticles: Particle[] = Array.from({ length: effect.count }, () => ({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            speed: Math.random() * effect.speed + effect.speed / 2,
            angle: Math.random() * Math.PI * 2,
            size: Math.random() * effect.size + effect.size / 2,
            color: effect.colors[Math.floor(Math.random() * effect.colors.length)],
            opacity: 1,
            lifetime: effect.lifetime,
            currentLife: 0
          }));
          setParticles(prev => [...prev, ...newParticles]);
        }

        setRevealedCards(prev => [...prev, card.id]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      if (!mounted) return;
      
      // Animation terminée
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (mounted) {
        onAnimationComplete(booster.cards);
      }
    };

    animate();

    return () => {
      mounted = false;
    };
  }, [isOpen, booster.cards, onAnimationComplete]);

  // Animation des particules
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || particles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajuster la taille du canvas
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Animation des particules
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mettre à jour et dessiner les particules
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

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, [particles]);

  if (!isOpen) return null;

  return (
    <div className={styles.animationContainer} ref={containerRef}>
      <canvas 
        className={styles.particleCanvas}
        ref={canvasRef}
      />
      
      {/* Booster pack initial */}
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
      
      {/* Booster pack shaking */}
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
      
      {/* Booster pack opening */}
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
      
      {/* Cards reveal */}
      {animationState === "revealing" && (
        <div className={styles.cardsReveal}>
          {booster.cards.map((card, index) => {
            const rarityEffect = RARITY_EFFECTS[card.rarity];
            const holographicEffect = HOLOGRAPHIC_EFFECTS[card.rarity];
            
            return (
              <div
                key={card.id}
                className={`
                  ${styles.card}
                  ${revealedCards.includes(card.id) ? styles.revealed : ""}
                  ${styles.holographic}
                `}
                data-rarity={card.rarity}
                style={{
                  transitionDelay: `${index * 0.8}s`,
                  "--glow-color": rarityEffect.visual.glow,
                  "--glow-intensity": rarityEffect.visual.intensity,
                  "--rotation-amount": `${rarityEffect.visual.rotation}deg`,
                  "--holographic-gradient": holographicEffect.gradient,
                  "--holographic-colors": holographicEffect.colors.join(", "),
                  "--holographic-intensity": holographicEffect.intensity
                } as React.CSSProperties}
              >
                <div className={styles.holographicOverlay} />
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
