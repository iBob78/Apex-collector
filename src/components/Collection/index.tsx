'use client'

import { useState } from 'react'
import { Card, type CardProps } from '@/components/Card'

export interface CollectionGridProps {
  cards: CardProps['card'][]
  onCardClick?: (card: CardProps['card']) => void
}

export const CollectionGrid = ({ cards, onCardClick }: CollectionGridProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const filteredCards = cards
    .filter(card => 
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'rarity') return a.rarity.localeCompare(b.rarity)
      if (sortBy === 'price') return a.price - b.price
      return 0
    })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search cards..."
          className="px-4 py-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="name">Sort by Name</option>
          <option value="rarity">Sort by Rarity</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCards.map((card) => (
          <Card key={card.id} card={card} onClick={onCardClick} />
        ))}
      </div>
    </div>
  )
}

export default CollectionGrid
