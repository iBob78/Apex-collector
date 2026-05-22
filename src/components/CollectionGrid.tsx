import React from 'react';
import { Card } from '@/types/card';
import CardDisplay from './cards/CardDisplay';

interface CollectionGridProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  loading?: boolean;
}

const CollectionGrid: React.FC<CollectionGridProps> = ({ 
  cards, 
  onCardClick,
  loading = false 
}) => {
  if (loading) {
    return <div className="flex justify-center items-center">Loading...</div>;
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="flex justify-center items-center p-4">
        <p className="text-gray-500">No cards in collection</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {cards.map((card) => (
        <CardDisplay 
          key={card.id} 
          card={card}
          onClick={() => onCardClick?.(card)}
        />
      ))}
    </div>
  );
};

export default CollectionGrid;
