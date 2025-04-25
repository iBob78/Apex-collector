import React from 'react';
import Image from 'next/image';

export type CardType = 'Sport' | 'Luxury' | 'Classic' | 'Concept';
export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface Card {
  id: string;
  name: string;
  image: string;
  type: CardType;
  rarity: CardRarity;
  description?: string;
  isCollected?: boolean;
}

interface CardDisplayProps {
  card: Card;
  isCollected?: boolean;
  onClick?: (card: Card) => void;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card, isCollected = false, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  return (
    <div
      className={`relative w-64 h-96 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105 ${
        isCollected ? 'border-2 border-green-500' : 'border border-gray-200'
      }`}
      onClick={handleClick}
    >
      <div className="relative h-48 w-full">
        <Image
          src={card.image}
          alt={card.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{card.name}</h3>
        <div className="flex gap-2 mb-2">
          <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">{card.type}</span>
          <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">{card.rarity}</span>
        </div>
        {card.description && (
          <p className="text-gray-600 text-sm">{card.description}</p>
        )}
        <div className="absolute bottom-4 right-4">
          {isCollected ? (
            <span className="text-green-500">✓ Collectée</span>
          ) : (
            <span className="text-gray-400">Non collectée</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDisplay;
