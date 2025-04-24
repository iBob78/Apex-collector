'use client'

import Card from './Card'

interface CollectionGridProps {
  cards: Array<{
    id: string
    name: string
    imageUrl: string
    rarity: string
    price: number
    owned: boolean
  }>
  onCardClick?: (card: CollectionGridProps['cards'][0]) => void
}

const CollectionGrid = ({ cards, onCardClick }: CollectionGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {cards.map((card) => (
        <Card key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  )
}

export default CollectionGrid
