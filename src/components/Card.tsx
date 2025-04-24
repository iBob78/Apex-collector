'use client'

import Image from 'next/image'
import { useState } from 'react'

interface CardProps {
  card: {
    id: string
    name: string
    imageUrl: string
    rarity: string
    price: number
    owned: boolean
  }
  onClick?: (card: CardProps['card']) => void
}

export default function Card({ card, onClick }: CardProps) {
  const [isLoading, setLoading] = useState(true)

  return (
    <div 
      data-testid="card"
      className="relative rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer"
      onClick={() => onClick?.(card)}
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={card.imageUrl}
          alt={card.name}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setLoading(false)}
        />
        {isLoading && (
          <div data-testid="loading-placeholder" className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
        <h3 className="text-white font-semibold">{card.name}</h3>
        <div className="flex items-center justify-between">
          <span className="px-2 py-1 rounded text-xs bg-yellow-500 text-black">
            {card.rarity}
          </span>
          <span className="text-white text-sm">
            ${card.price.toFixed(2)}
          </span>
        </div>
      </div>
      {card.owned && (
        <div className="absolute top-2 right-2">
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Owned
          </span>
        </div>
      )}
    </div>
  )
}
