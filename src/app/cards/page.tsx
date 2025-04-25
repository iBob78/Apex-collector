import React from 'react';
import { CarCard } from '@/lib/supabase/types';
import CarCardDisplay from '@/components/Cards/CarCardDisplay';

const DEMO_CAR: CarCard = {
  id: "1",
  created_at: "2025-04-25T10:38:13Z",
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

export default function CardsPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Toutes les Cartes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CarCardDisplay card={DEMO_CAR} showDetails={true} />
        </div>
      </div>
    </main>
  );
}
