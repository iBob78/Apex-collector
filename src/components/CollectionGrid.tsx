'use client'

import Card from './Card'

interface CardType {
  id: string
  name: string
  imageUrl: string
  rarity: string
  price: number
  owned: boolean
}

interface CollectionGridProps {
  cards: CardType[]
  onCardClick?: (card: CardType) => void
}

export default function CollectionGrid({ cards, onCardClick }: CollectionGridProps) {
  if (cards.length === 0) {
    return (
      <div 
        data-testid="empty-grid"
        className="flex items-center justify-center h-64 text-gray-500"
      >
        Aucune carte à afficher
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {cards.map((card) => (
        <Card key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  )
}
