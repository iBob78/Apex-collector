export type Rarity = 'Common' | 'Rare' | 'Ultra Rare' | 'Legendary' | 'Prototype';

export type VisualVariant = 'Holographic' | 'Carbon' | 'Kevlar' | 'Brushed Titanium';

export interface BaseCard {
  id: string;
  name: string;
  rarity: Rarity;
  visualVariant?: VisualVariant;
  imageUrl: string;
  releaseSet: string;
  isLimited: boolean;
  serialNumber?: number;
}

export interface VehicleCard extends BaseCard {
  type: 'Vehicle';
  stats: {
    speed: number;
    handling: number;
    endurance: number;
    tech: number;
  };
  manufacturer: string;
  year: number;
  variants?: string[];
}
