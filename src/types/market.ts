export interface MarketListing {
  id: string
  card_id: string
  seller_id: string
  price: number
  condition: 'New' | 'Used'
  listed_at: Date
  expires_at: Date
  status: 'Active' | 'Sold' | 'Expired'
}

export interface Transaction {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  price: number
  completed_at: Date
  status: 'Pending' | 'Completed' | 'Cancelled'
}
