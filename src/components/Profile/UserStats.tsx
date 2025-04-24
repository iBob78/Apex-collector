interface UserStatsProps {
  totalCards: number
  uniqueCards: number
  value: number
}

export default function UserStats({ totalCards, uniqueCards, value }: UserStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="text-center">
        <h3 className="text-lg font-bold">Total Cards</h3>
        <p>{totalCards}</p>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold">Unique Cards</h3>
        <p>{uniqueCards}</p>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold">Collection Value</h3>
        <p></p>
      </div>
    </div>
  )
}
