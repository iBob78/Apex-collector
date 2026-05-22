import React from 'react';
import Image from 'next/image';
import { Car } from '@/types/cars';
import styles from './CarCollectionAlbum.module.css';

interface CarCollectionAlbumProps {
  cars: Car[];
  collectedCars: string[];
  onCardClick?: (car: Car) => void;
}

const CarCollectionAlbum: React.FC<CarCollectionAlbumProps> = ({
  cars,
  collectedCars,
  onCardClick
}) => {
  return (
    <div className={styles.album}>
      {cars.map((car) => {
        const isCollected = collectedCars.includes(car.id);
        
        return (
          <div
            key={car.id}
            className={`${styles.card} ${isCollected ? styles.collected : styles.notCollected}`}
            onClick={() => onCardClick?.(car)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.cardImageContainer}>
              <Image
                src={isCollected ? car.imageUrl : '/placeholder-card.png'}
                alt={isCollected ? car.name : 'Carte non découverte'}
                fill
                sizes="200px"
                className={styles.cardImage}
                priority={false}
              />
            </div>
            <div className={styles.cardInfo}>
              <h3>{isCollected ? car.name : '???'}</h3>
              <span className={`${styles.rarity} ${styles[car.rarity.toLowerCase()]}`}>
                {isCollected ? car.rarity : '???'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CarCollectionAlbum;
