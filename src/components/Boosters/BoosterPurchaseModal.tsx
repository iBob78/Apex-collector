import React, { useState } from "react";
import { BoosterType } from "@/types/boosters";
import styles from "./BoosterPurchaseModal.module.css";
import BoosterOpeningAnimation from "./BoosterOpeningAnimation";

interface BoosterPurchaseModalProps {
  booster: BoosterType;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (booster: BoosterType) => Promise<void>;
  userCoins: number;
}

const BoosterPurchaseModal: React.FC<BoosterPurchaseModalProps> = ({
  booster,
  isOpen,
  onClose,
  onPurchase,
  userCoins,
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const canPurchase = userCoins >= booster.price;

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);
      await onPurchase(booster);
      setIsOpening(true);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleAnimationComplete = (cards: string[]) => {
    console.log("Cards revealed:", cards);
    setIsOpening(false);
    onClose();
  };

  if (!isOpen) return null;

  if (isOpening) {
    return (
      <BoosterOpeningAnimation
        booster={booster}
        isOpen={true}
        onClose={onClose}
        onAnimationComplete={handleAnimationComplete}
      />
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.modalContent}>
          <h2>Purchase Booster</h2>
          
          <div className={styles.boosterInfo}>
            <h3>{booster.name}</h3>
            <p>{booster.description}</p>
            
            <div className={styles.guaranteedCards}>
              <h4>Guaranteed Cards:</h4>
              <ul>
                {booster.guaranteedRarities?.map((guarantee, index) => (
                  <li key={index}>
                    {guarantee.count}x {guarantee.rarity}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.priceInfo}>
              <span className={styles.price}>Price: {booster.price} coins</span>
              <span className={styles.balance}>Your balance: {userCoins} coins</span>
            </div>

            {booster.isLimited && (
              <div className={styles.limitedInfo}>
                <span>Limited Edition: {booster.currentSupply}/{booster.maxSupply}</span>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.purchaseButton} ${!canPurchase ? styles.disabled : ""}`}
              onClick={handlePurchase}
              disabled={!canPurchase || isPurchasing}
            >
              {isPurchasing ? "Processing..." : "Purchase Booster"}
            </button>
            {!canPurchase && (
              <p className={styles.insufficientFunds}>
                Insufficient funds. You need {booster.price - userCoins} more coins.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoosterPurchaseModal;
