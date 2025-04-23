'use client'

import { useState } from 'react'
import { MarketListing as MarketListingType } from '@/types/market'
import { Card as CardType } from '@/types/card'
import Card from '@/components/Card/Card'

interface MarketListingProps {
  listing: MarketListingType
  card: CardType
  onBuy?: (listing: MarketListingType) => void
}

export default function MarketListing({ 
  listing, 
  card,
  onBuy 
}: MarketListingProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleBuy = () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }
    onBuy?.(listing)
    setIsConfirming(false)
  }

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="w-40">
          <Card card={card} />
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{card.name}</h3>
              <p className="text-gray-600">Condition: {listing.condition}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">${listing.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                Listed {new Date(listing.listed_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleBuy}
              className={`px-6 py-2 rounded-lg ${
                isConfirming 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors`}
            >
              {isConfirming ? 'Confirm Purchase' : 'Buy Now'}
            </button>
            {isConfirming && (
              <button
                onClick={() => setIsConfirming(false)}
                className="ml-2 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
