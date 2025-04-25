'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import CarCollectionAlbum from '@/components/Collection/CarCollectionAlbum'
import { Car } from '@/types/cars'

export default function CollectionPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [collectedCars, setCollectedCars] = useState<string[]>([])
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Récupérer toutes les voitures
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('*')

        if (carsError) throw carsError

        // Récupérer les voitures collectées par l'utilisateur
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: userCars, error: userCarsError } = await supabase
            .from('user_cars')
            .select('car_id')
            .eq('user_id', session.user.id)

          if (userCarsError) throw userCarsError
          setCollectedCars(userCars.map(uc => uc.car_id))
        }

        setCars(carsData as Car[])
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error)
      }
    }

    fetchCars()
  }, [supabase])

  const handleCardClick = async (car: Car) => {
    if (collectedCars.includes(car.id)) {
      // Afficher les détails de la voiture
      console.log('Détails de la voiture:', car)
    } else {
      // La voiture n'est pas encore collectée
      console.log('Voiture non collectée:', car.name)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <CarCollectionAlbum
        cars={cars}
        collectedCars={collectedCars}
        onCardClick={handleCardClick}
      />
    </main>
  )
}
