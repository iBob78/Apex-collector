import { Collection } from './collection'
cat << 'EOF' > src/types/user.ts
import { Collection } from './collection'

export interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
  collections: Collection[]
  reputation: number
  joined_at: Date
  statistics: {
    cards_collected: number
    trades_completed: number
    collections_created: number
  }
}
