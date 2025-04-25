'use client';

import { useState } from 'react';
import Image from 'next/image';
import { VehicleCard } from '@/types/cards';
import { motion } from 'framer-motion';

interface CardDisplayProps {
  card: VehicleCard;
  isRevealing?: boolean;
  onClick?: () => void;
}

const StatBar = ({ value, maxValue = 100, label }: { value: number; maxValue?: number; label: string }) => {
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{value}/{maxValue}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / maxValue) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-2 rounded-full bg-blue-600"
        />
      </div>
    </div>
  );
};

const CardDisplay = ({ card, isRevealing, onClick }: CardDisplayProps): JSX.Element => {
  const [isFlipped, setIsFlipped] = useState(false);

  const rarityColors = {
    'Common': 'bg-gray-500',
    'Rare': 'bg-blue-500',
    'Ultra Rare': 'bg-purple-500',
    'Legendary': 'bg-yellow-500',
    'Prototype': 'bg-red-500'
  };

  const variantEffects = {
    'Holographic': 'hover:shadow-rainbow',
    'Carbon': 'hover:shadow-carbon',
    'Kevlar': 'hover:shadow-kevlar',
    'Brushed Titanium': 'hover:shadow-titanium'
  };

  const baseClassName = [
    'relative w-64 h-96 rounded-lg cursor-pointer',
    'transform transition-all duration-300 ease-in-out',
    card.visualVariant ? variantEffects[card.visualVariant] : 'hover:shadow-xl',
    isRevealing ? 'animate-reveal' : ''
  ].join(' ');

  return (
    <motion.div
      className={baseClassName}
      onClick={() => {
        setIsFlipped(!isFlipped);
        onClick?.();
      }}
      whileHover={{ scale: 1.05 }}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
    >
      <div className={`absolute inset-0 ${rarityColors[card.rarity]} rounded-lg p-4`}>
        <div className="relative h-40 mb-4">
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            className="object-cover rounded"
            priority={isRevealing}
          />
          {card.isLimited && (
            <span className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-xs">
              #{card.serialNumber}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{card.name}</h3>
        <div className="text-sm text-white mb-4">
          <p>{card.manufacturer} - {card.year}</p>
        </div>

        <div className="space-y-2">
          <StatBar value={card.stats.speed} label="Speed" />
          <StatBar value={card.stats.handling} label="Handling" />
          <StatBar value={card.stats.endurance} label="Endurance" />
          <StatBar value={card.stats.tech} label="Tech" />
        </div>
      </div>
    </motion.div>
  );
};

export default CardDisplay;
