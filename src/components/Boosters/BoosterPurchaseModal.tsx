import React, { useState } from 'react';
import { BoosterType } from './BoosterCard';
import BoosterOpeningAnimation from './BoosterOpeningAnimation';
import styles from './BoosterPurchaseModal.module.css';

interface BoosterPurchaseModalProps {
  booster: BoosterType;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: (cards: string[]) => void;
}

export default function BoosterPurchaseModal({
  booster,
  isOpen,
  onClose,
  onPurchaseComplete
}: BoosterPurchaseModalProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [purchasedCards, setPurchasedCards] = useState<string[]>([]);

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);
      // Simulation d'un appel API pour l'achat
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulation des cartes obtenues
      const mockCards = ['Card1', 'Card2', 'Card3'];
      setPurchasedCards(mockCards);
      setIsOpening(true);
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleAnimationComplete = () => {
    if (purchasedCards.length > 0) {
      onPurchaseComplete?.(purchasedCards);
    }
    onClose();
  };

  if (isOpening) {
    return (
      <BoosterOpeningAnimation
        booster={booster}
        isOpen={true}
        onAnimationComplete={() => handleAnimationComplete()}
      />
    );
  }

  return (
    <div className={`${styles.modal} ${isOpen ? styles.open : ''}`}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2>Acheter {booster.name}</h2>
        <p>{booster.description}</p>
        <p className={styles.price}>Prix : {booster.price} €</p>
        <button
          className={styles.purchaseButton}
          onClick={handlePurchase}
          disabled={isPurchasing}
        >
          {isPurchasing ? 'Achat en cours...' : 'Acheter maintenant'}
        </button>
      </div>
    </div>
  );
}
