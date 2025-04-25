import Image from 'next/image';
import styles from './BoosterCard.module.css';

interface BoosterCardProps {
  booster: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    description: string;
  };
}

export default function BoosterCard({ booster }: BoosterCardProps) {
  return (
    <div className={styles.boosterCard}>
      <div className={styles.imageContainer}>
        <Image
          src={booster.imageUrl}
          alt={booster.name}
          sizes="200px"
          fill
          className={styles.boosterImage}
          priority={false}
        />
      </div>
      <div className={styles.boosterInfo}>
        <h3>{booster.name}</h3>
        <p>{booster.description}</p>
        <span className={styles.price}>{booster.price} €</span>
      </div>
    </div>
  );
}
