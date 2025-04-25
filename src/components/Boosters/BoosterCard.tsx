import React from "react";
import { BoosterType } from "@/types/boosters";
import Image from "next/image";
import styles from "./BoosterCard.module.css";

interface BoosterCardProps {
  booster: BoosterType;
  onClick?: () => void;
}

const BoosterCard: React.FC<BoosterCardProps> = ({ booster, onClick }) => {
  return (
    <div 
      className={`${styles.boosterCard} ${styles[booster.rarity.toLowerCase()]}`}
      onClick={onClick}
    >
      <div className={styles.imageContainer}>
        <Image
          src={booster.imageUrl}
          alt={booster.name}
          width={200}
          height={300}
          className={styles.boosterImage}
        />
      </div>
      <div className={styles.boosterInfo}>
        <h3 className={styles.boosterName}>{booster.name}</h3>
        <p className={styles.boosterDescription}>{booster.description}</p>
        <div className={styles.boosterDetails}>
          <span className={styles.cardCount}>{booster.cardCount} cards</span>
          <span className={styles.price}>{booster.price} coins</span>
        </div>
        {booster.isLimited && (
          <div className={styles.limitedInfo}>
            <span>Limited Edition</span>
            {booster.currentSupply && booster.maxSupply && (
              <span>{booster.currentSupply}/{booster.maxSupply}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoosterCard;
