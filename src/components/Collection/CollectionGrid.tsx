'use client'

import { Card as CardType } from '@/types/card'
import Card from '@/components/Card/Card'
import { useState } from 'react'

interface CollectionGridProps {
  cards: CardType[]
  onCardClick?: (card: CardType) => void
  className?: string
}

export default function CollectionGrid({ 
  cards, 
  onCardClick,
  className = '' 
}: CollectionGridProps) {
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'price'>('name')

  const filteredCards = cards
    .filter(card => 
      card.name.toLowerCase().includes(filter.toLowerCase()) ||
      card.rarity.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rarity':
          return getRarityValue(b.rarity) - getRarityValue(a.rarity)
        case 'price':
          return (b.market_price || 0) - (a.market_price || 0)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search cards..."
          className="px-4 py-2 border rounded-lg flex-grow"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="name">Sort by Name</option>
          <option value="rarity">Sort by Rarity</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
        {filteredCards.map(card => (
          <Card
            key={card.id}
            card={card}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  )
}

function getRarityValue(rarity: CardType['rarity']): number {
  switch (rarity) {
    case 'Legendary': return 4
    case 'Epic': return 3
    case 'Rare': return 2
    case 'Common': return 1
    default: return 0
  }
}
