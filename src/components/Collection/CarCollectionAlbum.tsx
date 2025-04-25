import React, { useState } from 'react';
import { CarCard } from '@/lib/supabase/types';
import CarCardDisplay from '../Cards/CarCardDisplay';
import styles from './CarCollectionAlbum.module.css';

interface CarCollectionAlbumProps {
  cars: CarCard[];
  collectedCars: Set<string>;
  onCardClick?: (car: CarCard) => void;
}

const CarCollectionAlbum: React.FC<CarCollectionAlbumProps> = ({
  cars,
  collectedCars,
  onCardClick
}) => {
  const [filter, setFilter] = useState({
    make: '',
    year: '',
    rarity: '',
    searchTerm: '',
    sortBy: 'collection_number'
  });

  // Get unique makes and years for filters
  const makes = Array.from(new Set(cars.map(car => car.make))).sort();
  const years = Array.from(new Set(cars.map(car => car.year))).sort((a, b) => b - a);

  const filteredCars = cars.filter(car => {
    if (filter.make && car.make !== filter.make) return false;
    if (filter.year && car.year !== parseInt(filter.year)) return false;
    if (filter.rarity && car.rarity !== filter.rarity) return false;
    if (filter.searchTerm && !car.name.toLowerCase().includes(filter.searchTerm.toLowerCase())) return false;
    return true;
  });

  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (filter.sortBy) {
      case 'power':
        return b.power_hp - a.power_hp;
      case 'speed':
        return b.max_speed_kmh - a.max_speed_kmh;
      case 'year':
        return b.year - a.year;
      case 'popularity':
        return b.popularity - a.popularity;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return a.collection_number - b.collection_number;
    }
  });

  const collectionStats = {
    total: cars.length,
    collected: collectedCars.size,
    percentage: Math.round((collectedCars.size / cars.length) * 100),
    byRarity: {
      common: cars.filter(car => car.rarity === 'common').length,
      uncommon: cars.filter(car => car.rarity === 'uncommon').length,
      rare: cars.filter(car => car.rarity === 'rare').length,
      epic: cars.filter(car => car.rarity === 'epic').length,
      legendary: cars.filter(car => car.rarity === 'legendary').length
    }
  };

  return (
    <div className={styles.albumContainer}>
      <div className={styles.header}>
        <h2>Car Collection</h2>
        <div className={styles.stats}>
          <div className={styles.mainStats}>
            <span>Collected: {collectionStats.collected}/{collectionStats.total} ({collectionStats.percentage}%)</span>
          </div>
          <div className={styles.rarityStats}>
            {Object.entries(collectionStats.byRarity).map(([rarity, count]) => (
              <span key={rarity} className={styles[rarity]}>
                {rarity}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search cars..."
          value={filter.searchTerm}
          onChange={e => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
          className={styles.searchInput}
        />
        
        <select
          value={filter.make}
          onChange={e => setFilter(prev => ({ ...prev, make: e.target.value }))}
          className={styles.filterSelect}
        >
          <option value="">All Makes</option>
          {makes.map(make => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>

        <select
          value={filter.year}
          onChange={e => setFilter(prev => ({ ...prev, year: e.target.value }))}
          className={styles.filterSelect}
        >
          <option value="">All Years</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          value={filter.rarity}
          onChange={e => setFilter(prev => ({ ...prev, rarity: e.target.value }))}
          className={styles.filterSelect}
        >
          <option value="">All Rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>

        <select
          value={filter.sortBy}
          onChange={e => setFilter(prev => ({ ...prev, sortBy: e.target.value }))}
          className={styles.filterSelect}
        >
          <option value="collection_number">Collection Number</option>
          <option value="power">Power</option>
          <option value="speed">Top Speed</option>
          <option value="year">Year</option>
          <option value="popularity">Popularity</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className={styles.cardsGrid}>
        {sortedCars.map(car => (
          <div key={car.id} className={styles.cardSlot}>
            <CarCardDisplay
              card={car}
              isCollected={collectedCars.has(car.id)}
              onClick={() => onCardClick?.(car)}
              size="medium"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarCollectionAlbum;
