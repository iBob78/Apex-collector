interface CardProps {
  name: string
  rarity?: string
  price?: string
  onClick?: () => void
}

export default function Card({ name, rarity, price, onClick }: CardProps) {
  return (
    <div 
      className="border rounded p-4 cursor-pointer hover:shadow-lg"
      onClick={onClick}
      data-testid="card"
    >
      <h3 className="text-lg font-bold">{name}</h3>
      {rarity && <p className="text-sm text-gray-600">{rarity}</p>}
      {price && <p className="text-sm text-blue-600">{price}</p>}
    </div>
  )
}
