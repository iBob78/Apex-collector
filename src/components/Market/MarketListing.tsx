import { useState } from 'react'
import Button from '../ui/button'

interface Card {
  name: string
  rarity: string
  price: string
}

interface MarketListingProps {
  id: string
  card: Card
  seller: string
  price: number
  onBuy?: (id: string) => void
}

export default function MarketListing({ id, card, seller, price, onBuy }: MarketListingProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleBuy = async () => {
    if (!onBuy) return
    setIsLoading(true)
    try {
      await onBuy(id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border rounded p-4" data-testid="market-listing">
      <h3 className="text-lg font-bold">{card.name}</h3>
      <p className="text-sm text-gray-600">Seller: {seller}</p>
      <p className="text-sm text-blue-600">Price: </p>
      <Button
        onClick={handleBuy}
        disabled={isLoading}
        className={}
      >
        {isLoading ? 'Processing...' : 'Buy Now'}
      </Button>
    </div>
  )
}
