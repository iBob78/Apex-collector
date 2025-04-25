'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CarCollectionAlbum from '@/components/Collection/CarCollectionAlbum';
import { Car } from '@/types/cars';

export default function CollectionPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [collectedCars, setCollectedCars] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Récupérer toutes les voitures
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('*');

        if (carsError) throw carsError;

        // Récupérer les voitures collectées par l'utilisateur
        const { data: userCars, error: userCarsError } = await supabase
          .from('user_cars')
          .select('car_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (userCarsError) throw userCarsError;

        setCars(carsData as Car[]);
        setCollectedCars(userCars.map(uc => uc.car_id));
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchCars();
  }, [supabase]);

  const handleCardClick = async (car: Car) => {
    if (collectedCars.includes(car.id)) {
      // Afficher les détails de la voiture
      console.log('Détails de la voiture:', car);
    } else {
      // La voiture n'est pas encore collectée
      console.log('Voiture non collectée:', car.name);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <CarCollectionAlbum
        cars={cars}
        collectedCars={collectedCars}
        onCardClick={handleCardClick}
      />
    </main>
  );
}
