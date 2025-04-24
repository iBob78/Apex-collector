interface MarketListingProps {
  id: string
  card: {
    name: string
    rarity: string
    price: string
  }
  seller: string
  price: number
  onBuy?: (id: string) => void
}

export default function MarketListing({ id, card, seller, price, onBuy }: MarketListingProps) {
  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-bold">{card.name}</h3>
      <p className="text-sm text-gray-600">Seller: {seller}</p>
      <p className="text-sm text-blue-600">Price: </p>
      <button
        onClick={() => onBuy?.(id)}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Buy Now
      </button>
    </div>
  )
}
