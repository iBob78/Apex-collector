export type CardVisualVariant = 'normal' | 'holographic' | 'rainbow' | 'gold' | 'platinum';

export interface VehicleCard {
  id: string
  name: string
  description: string
  image_url: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  serial_number: string
  visualVariant?: CardVisualVariant
  stats: {
    speed: number
    acceleration: number
    handling: number
    braking: number
  }
}
