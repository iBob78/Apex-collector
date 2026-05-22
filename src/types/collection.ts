import { VehicleCard } from './cards'

export interface Collection {
  id: string
  name: string
  description?: string
  cards: VehicleCard[]
  created_at: Date
  updated_at: Date
  is_public: boolean
  owner_id: string
}
