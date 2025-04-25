import React from 'react'
import { useState } from 'react'
import { Card, CardDisplay } from '@/components/Cards/CardDisplay'

export interface CollectionGridProps {
  cards: Card[]
  collectedCards?: Set<string>
  onCardClick?: (card: Card) => void
}

export const CollectionGrid: React.FC<CollectionGridProps> = ({
  cards,
  collectedCards = new Set(),
  onCardClick,
}) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
    if (onCardClick) {
      onCardClick(card)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {cards.map((card) => (
        <CardDisplay
          key={card.id}
          card={card}
          isCollected={collectedCards.has(card.id)}
          onClick={handleCardClick}
        />
      ))}
    </div>
  )
}

export default CollectionGrid
