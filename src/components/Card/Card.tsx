'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card as CardType } from '@/types/card'

interface CardProps {
  card: CardType
  onClick?: (card: CardType) => void
  className?: string
}

export default function Card({ card, onClick, className = '' }: CardProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div 
      className={`relative rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 ${className}`}
      onClick={() => onClick?.(card)}
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={card.image_url}
          alt={card.name}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoadingComplete={() => setIsLoading(false)}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
      
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
        <h3 className="text-white font-semibold">{card.name}</h3>
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs ${getRarityColor(card.rarity)}`}>
            {card.rarity}
          </span>
          {card.market_price && (
            <span className="text-white text-sm">
              ${card.market_price.toFixed(2)}
            </span>
          )}
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

function getRarityColor(rarity: CardType['rarity']) {
  switch (rarity) {
    case 'Common':
      return 'bg-gray-500 text-white'
    case 'Rare':
      return 'bg-blue-500 text-white'
    case 'Epic':
      return 'bg-purple-500 text-white'
    case 'Legendary':
      return 'bg-yellow-500 text-black'
    default:
      return 'bg-gray-500 text-white'
  }
}
