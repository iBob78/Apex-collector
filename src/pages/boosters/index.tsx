import React, { useState } from "react";
import { BoosterType } from "@/types/boosters";
import BoosterGrid from "@/components/Boosters/BoosterGrid";
import BoosterPurchaseModal from "@/components/Boosters/BoosterPurchaseModal";
import styles from "./index.module.css";

// Exemple de données de test
const mockBoosters: BoosterType[] = [
  {
    id: "starter-pack-1",
    name: "Starter Pack",
    description: "A perfect pack for beginners with guaranteed common cards.",
    rarity: "Common",
    price: 100,
    cardCount: 5,
    guaranteedRarities: [
      { rarity: "Common", count: 3 },
      { rarity: "Uncommon", count: 2 }
    ],
    imageUrl: "/images/boosters/starter-pack.jpg",
    releaseSet: "Base Set",
    isLimited: false,
  },
  {
    id: "premium-pack-1",
    name: "Premium Pack",
    description: "Contains rare cards with a chance of epic pulls!",
    rarity: "Rare",
    price: 500,
    cardCount: 7,
    guaranteedRarities: [
      { rarity: "Rare", count: 2 },
      { rarity: "Uncommon", count: 3 },
      { rarity: "Common", count: 2 }
    ],
    imageUrl: "/images/boosters/premium-pack.jpg",
    releaseSet: "Premium Collection",
    isLimited: true,
    maxSupply: 1000,
    currentSupply: 578,
  },
  {
    id: "legendary-pack-1",
    name: "Legendary Pack",
    description: "The ultimate pack with guaranteed legendary card!",
    rarity: "Legendary",
    price: 2000,
    cardCount: 10,
    guaranteedRarities: [
      { rarity: "Legendary", count: 1 },
      { rarity: "Epic", count: 2 },
      { rarity: "Rare", count: 3 },
      { rarity: "Uncommon", count: 4 }
    ],
    imageUrl: "/images/boosters/legendary-pack.jpg",
    releaseSet: "Legends",
    isLimited: true,
    maxSupply: 100,
    currentSupply: 23,
  }
];

const BoostersPage: React.FC = () => {
  const [selectedBooster, setSelectedBooster] = useState<BoosterType | null>(null);
  const [userCoins] = useState(1000); // À remplacer plus tard par un vrai système de devise

  const handleBoosterClick = (booster: BoosterType) => {
    setSelectedBooster(booster);
  };

  const handlePurchase = async (booster: BoosterType) => {
    // Simulation d'achat - à remplacer par une vraie API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Booster purchased:", booster);
        resolve();
      }, 1000);
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Available Boosters</h1>
      <div className={styles.userInfo}>
        <span className={styles.coins}>{userCoins} coins</span>
      </div>
      <BoosterGrid 
        boosters={mockBoosters} 
        onBoosterClick={handleBoosterClick}
      />
      {selectedBooster && (
        <BoosterPurchaseModal
          booster={selectedBooster}
          isOpen={true}
          onClose={() => setSelectedBooster(null)}
          onPurchase={handlePurchase}
          userCoins={userCoins}
        />
      )}
    </div>
  );
};

export default BoostersPage;
