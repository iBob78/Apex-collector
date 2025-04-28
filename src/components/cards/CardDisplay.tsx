import React from 'react';
import { Card } from '@/types/card';

interface CardDisplayProps {
  card: Card;
  onClick?: () => void;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, onClick }) => {
  const rarityColors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500'
  };

  return (
    <div 
      className={`p-4 rounded-lg shadow-lg cursor-pointer ${rarityColors[card.rarity as keyof typeof rarityColors] || 'bg-gray-500'}`}
      onClick={onClick}
    >
      <h3 className="text-xl font-bold">{card.name}</h3>
      <p className="text-sm">{card.manufacturer} - {card.year}</p>
      <div className="mt-4">
        <div className="flex justify-between mb-2">
          <span>Speed</span>
          <span>{card.stats.speed}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Handling</span>
          <span>{card.stats.handling}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Endurance</span>
          <span>{card.stats.endurance}</span>
        </div>
        <div className="flex justify-between">
          <span>Tech</span>
          <span>{card.stats.tech}</span>
        </div>
      </div>
    </div>
  );
};

export default CardDisplay;
