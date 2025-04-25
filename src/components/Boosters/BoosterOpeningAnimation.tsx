import React from 'react';
import Image from 'next/image';
import { BoosterType } from './BoosterCard';
import styles from './BoosterOpeningAnimation.module.css';

interface BoosterOpeningAnimationProps {
  booster: BoosterType;
  isOpen: boolean;
  onAnimationComplete?: () => void;
}

const BoosterOpeningAnimation: React.FC<BoosterOpeningAnimationProps> = ({
  booster,
  isOpen,
  onAnimationComplete
}) => {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, 2000); // Animation de 2 secondes

      return () => clearTimeout(timer);
    }
  }, [isOpen, onAnimationComplete]);

  return (
    <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
      <div className={styles.boosterWrapper}>
        <div className={`${styles.boosterFront} ${isOpen ? styles.opened : ''}`}>
          <Image
            src={booster.imageUrl}
            alt={booster.name}
            fill
            sizes="300px"
            className={styles.boosterImage}
            priority
          />
        </div>
        <div className={`${styles.boosterBack} ${isOpen ? styles.opened : ''}`}>
          <div className={styles.cardBack}>
            <span className={styles.glowEffect} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoosterOpeningAnimation;
