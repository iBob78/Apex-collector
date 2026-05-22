import { BoosterType } from './BoosterCard';
import BoosterCard from './BoosterCard';
import styles from './BoosterGrid.module.css';

interface BoosterGridProps {
  boosters: BoosterType[];
  onBoosterClick?: (booster: BoosterType) => void;
}

export default function BoosterGrid({ boosters, onBoosterClick }: BoosterGridProps) {
  return (
    <div className={styles.boosterGrid}>
      {boosters.map((booster) => (
        <BoosterCard
          key={booster.id}
          booster={booster}
          onClick={() => onBoosterClick?.(booster)}
        />
      ))}
    </div>
  );
}
