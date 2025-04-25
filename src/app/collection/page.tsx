import React from 'react';
import CarCollectionAlbum from '@/components/Collection/CarCollectionAlbum';
import { CarCard } from '@/lib/supabase/types';

const DEMO_CAR: CarCard = {
  id: "1",
  created_at: "2025-04-25T10:11:07Z",
  card_id: "FERRARI-F40-1987",
  name: "Ferrari F40",
  rarity: "legendary",
  image_url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1000",
  description: "A legendary supercar that marked Ferrari's 40th anniversary. The last car personally approved by Enzo Ferrari.",
  power_hp: 478,
  torque_nm: 577,
  max_speed_kmh: 324,
  weight_t: 1.1,
  make: "Ferrari",
  model: "F40",
  year: 1987,
  acceleration: "3.8",
  popularity: 95,
  is_holographic: true,
  price_eur: 1400000,
  collection_number: 1,
  total_in_collection: 100
};

export default function CollectionPage() {
  // Pour le moment, nous utilisons une seule voiture de démonstration
  const cars = [DEMO_CAR];
  const collectedCars = new Set([DEMO_CAR.id]);

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <CarCollectionAlbum
        cars={cars}
        collectedCars={collectedCars}
        onCardClick={(car) => console.log('Clicked car:', car)}
      />
    </main>
  );
}
