import React, { useState } from 'react';
import { Card, CardDisplay, CardType, CardRarity } from '../Cards/CardDisplay';
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

  const cardTypes: CardType[] = ['Sport', 'Luxury', 'Classic', 'Concept'];
  const cardRarities: CardRarity[] = ['Common', 'Rare', 'Epic', 'Legendary'];

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
          {cardTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={filter.rarity}
          onChange={e => setFilter(prev => ({ ...prev, rarity: e.target.value }))}
          className={styles.filterSelect}
        >
          <option value="">All Rarities</option>
          {cardRarities.map(rarity => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>
      </div>

      <div className={styles.cardsGrid}>
        {filteredCards.map(card => (
          <div key={card.id} className={styles.cardSlot}>
            <CardDisplay
              card={card}
              isCollected={collectedCards.has(card.id)}
              onClick={onCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionAlbum;
