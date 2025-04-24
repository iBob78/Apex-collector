import Card from './Card'

type CardType = {
  id: number
  name: string
  rarity?: string
  price?: string
}

interface CollectionGridProps {
  items: CardType[]
  onCardClick?: (card: CardType) => void
}

export default function CollectionGrid({ items = [], onCardClick }: CollectionGridProps) {
  if (!items || items.length === 0) {
    return <div className="text-center p-4">No items in collection</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {items.map((card) => (
        <Card 
          key={card.id} 
          name={card.name}
          rarity={card.rarity}
          price={card.price}
          onClick={() => onCardClick?.(card)}
        />
      ))}
    </div>
  )
}
