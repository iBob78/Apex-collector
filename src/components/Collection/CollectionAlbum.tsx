import React, { useState } from 'react';
import { Card } from '../Cards/CardDisplay';
import styles from './CollectionAlbum.module.css';

interface CollectionAlbumProps {
  cards: Card[];
  collectedCards: Set<string>;
  onCardClick?: (card: Card) => void;
}

const CollectionAlbum: React.FC<CollectionAlbumProps> = ({
  cards,
  collectedCards,
  onCardClick
}) => {
  const [filter, setFilter] = useState({
    type: '',
    rarity: '',
    searchTerm: ''
  });

  const filteredCards = cards.filter(card => {
    if (filter.type && card.type !== filter.type) return false;
    if (filter.rarity && card.rarity !== filter.rarity) return false;
    if (filter.searchTerm && !card.name.toLowerCase().includes(filter.searchTerm.toLowerCase())) return false;
    return true;
  });

  const collectionStats = {
    total: cards.length,
    collected: collectedCards.size,
    percentage: Math.round((collectedCards.size / cards.length) * 100)
  };

  return (
    <div className={styles.albumContainer}>
      <div className={styles.header}>
        <h2>Collection Album</h2>
        <div className={styles.stats}>
          <span>
            Collected: {collectionStats.collected}/{collectionStats.total} 
            ({collectionStats.percentage}%)
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search cards..."
          value={filter.searchTerm}
          onChange={e => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
          className={styles.searchInput}
        />
        <select
          value={filter.type}
          onChange={e => setFilter(prev => ({ ...prev, type: e.target.value }))}
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          {/* Add options based on CardType enum */}
        </select>
        <select
          value={filter.rarity}
          onChange={e => setFilter(prev => ({ ...prev, rarity: e.target.value }))}
          className={styles.filterSelect}
        >
          <option value="">All Rarities</option>
          {/* Add options based on CardRarity enum */}
        </select>
      </div>

      <div className={styles.cardsGrid}>
        {filteredCards.map(card => (
          <div key={card.id} className={styles.cardSlot}>
            {/* Placeholder for CardDisplay component */}
            <div
              className={`
                ${styles.cardPlaceholder}
                ${collectedCards.has(card.id) ? styles.collected : styles.missing}
              `}
              onClick={() => onCardClick?.(card)}
            >
              {card.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionAlbum;
