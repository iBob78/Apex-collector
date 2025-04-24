import React from "react"

interface CardProps {
  card: {
    name: string
    rarity: string
    price: number
  }
}

const Card: React.FC<CardProps> = ({ card }) => {
  return (
    <div data-testid="card">
      <h3>{card.name}</h3>
      <p>{card.rarity}</p>
      <p>${card.price.toFixed(2)}</p>
    </div>
  )
}

export default Card
