export interface Card {
  id: string
  name: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  type: 'Weapon' | 'Legend' | 'Skin'
  collection: string
  image_url: string
  owned: boolean
  market_price?: number
}

export interface Collection {
  id: string
  name: string
  cards: Card[]
  completion: number
  created_at: Date
  last_updated: Date
}
