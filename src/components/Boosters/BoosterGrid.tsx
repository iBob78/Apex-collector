import React from "react";
import { BoosterType } from "@/types/boosters";
import BoosterCard from "./BoosterCard";
import styles from "./BoosterGrid.module.css";

interface BoosterGridProps {
  boosters: BoosterType[];
  onBoosterClick?: (booster: BoosterType) => void;
}

const BoosterGrid: React.FC<BoosterGridProps> = ({ 
  boosters,
  onBoosterClick
}) => {
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
};

export default BoosterGrid;
