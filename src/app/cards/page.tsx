import VehicleCard from '@/components/Card/VehicleCard'

export default function CardsPage() {
  const exampleCard: VehicleCard = {
    id: '1',
    name: 'Ferrari F40',
    description: 'Une supercar légendaire produite de 1987 à 1992',
    image_url: '/F40.jpg', // Chemin corrigé pour correspondre à l'image dans public/
    rarity: 'legendary',
    serial_number: '001/100',
    stats: {
      speed: 95,
      acceleration: 90,
      handling: 85,
      braking: 80
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <VehicleCard card={exampleCard} />
    </div>
  )
}
