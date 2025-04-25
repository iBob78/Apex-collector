export interface Car {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  description?: string;
  price?: number;
  model?: string;
  year?: number;
}

export type CarCard = Car;
