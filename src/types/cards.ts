export interface VehicleCard {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  serial_number: string;
  stats: {
    speed: number;        // 0-100
    acceleration: number; // 0-100
    handling: number;     // 0-100
    braking: number;      // 0-100
  }
}
