export type BoosterRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export type BoosterType = {
  id: string;
  name: string;
  description: string;
  rarity: BoosterRarity;
  price: number;
  cardCount: number;
  guaranteedRarities?: {
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    count: number;
  }[];
  imageUrl: string;
  releaseSet: string;
  isLimited: boolean;
  serialNumber?: number;
  maxSupply?: number;
  currentSupply?: number;
};

export type BoosterPack = {
  booster: BoosterType;
  cards: string[]; // IDs des cartes contenues dans le booster
  opened: boolean;
  purchaseDate: string;
  openDate?: string;
};

export type BoosterSet = {
  id: string;
  name: string;
  description: string;
  releaseDate: string;
  endDate?: string;
  boosters: BoosterType[];
  imageUrl: string;
  isActive: boolean;
};
