export interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url?: string
  collections: Collection[]
  reputation: number
  joined_at: Date
  statistics: {
    cards_owned: number
    collections_completed: number
    successful_trades: number
  }
}
