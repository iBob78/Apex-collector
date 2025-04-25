import CardDisplay from '@/components/cards/CardDisplay'

export default function CardsPage() {
  const exampleCards = [
    {
      id: '1',
      name: 'Ferrari F40',
      description: 'Une supercar légendaire produite de 1987 à 1992',
      image_url: '/F40.jpg',
      rarity: 'legendary',
      serial_number: '001/100',
      visualVariant: 'holographic' as const,
      stats: {
        speed: 95,
        acceleration: 90,
        handling: 85,
        braking: 80
      }
    }
  ]

  return (
    <main className="container mx-auto p-8">
      <h1 className="title text-3xl mb-8">Cartes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
        {exampleCards.map(card => (
          <CardDisplay key={card.id} card={card} />
        ))}
      </div>
    </main>
  )
}
