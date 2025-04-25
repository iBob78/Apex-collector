'use client';

import React from 'react';
import Image from 'next/image';
import { CarCard } from '@/lib/supabase/types';

interface CarCardDisplayProps {
  card: CarCard;
  isCollected?: boolean;
  onClick?: (card: CarCard) => void;
  showDetails?: boolean;
  className?: string;
}

const CarCardDisplay: React.FC<CarCardDisplayProps> = ({
  card,
  isCollected = false,
  onClick,
  showDetails = false,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      <div className="aspect-w-3 aspect-h-4">
        <div className="relative w-full h-64">
          <Image
            src={card.image_url}
            alt={card.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{card.name}</h3>
          <span className={`px-2 py-1 text-xs rounded ${
            card.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
            card.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
            card.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {card.rarity}
          </span>
        </div>

        {showDetails && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{card.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Puissance:</span> {card.power_hp} ch
              </div>
              <div>
                <span className="font-semibold">0-100:</span> {card.acceleration}s
              </div>
              <div>
                <span className="font-semibold">Vitesse max:</span> {card.max_speed_kmh} km/h
              </div>
              <div>
                <span className="font-semibold">Poids:</span> {card.weight_t}t
              </div>
            </div>
          </div>
        )}

        {isCollected && (
          <div className="absolute top-2 right-2">
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
              Collectée
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarCardDisplay;
