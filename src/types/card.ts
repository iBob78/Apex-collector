export interface Card {
  id: string;
  name: string;
  rarity: string;
  manufacturer: string;
  year: number;
  stats: {
    speed: number;
    handling: number;
    endurance: number;
    tech: number;
  };
}
