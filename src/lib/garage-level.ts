/** Paliers d'écurie basés sur les véhicules différents actuellement possédés. */
const GARAGE_RANKS = [
  { minVehicles: 0, level: 0, title: 'Non classé' },
  { minVehicles: 10, level: 1, title: 'Rookie' },
  // Le niveau 2 n'existe pas dans le barème défini pour l'écurie.
  { minVehicles: 50, level: 3, title: 'Débutant' },
  { minVehicles: 100, level: 4, title: 'Amateur' },
  { minVehicles: 200, level: 5, title: 'Confirmé' },
  { minVehicles: 500, level: 6, title: 'Collectionneur' },
  { minVehicles: 1000, level: 7, title: 'Professionnel' },
  { minVehicles: 2000, level: 8, title: 'Célèbre' },
  { minVehicles: 5000, level: 9, title: 'Légendaire' },
] as const;

export function getGarageProgress(uniqueVehicles: number) {
  const count = Number.isFinite(uniqueVehicles) ? Math.max(0, Math.floor(uniqueVehicles)) : 0;
  const rankIndex = GARAGE_RANKS.reduce(
    (current, rank, index) => (count >= rank.minVehicles ? index : current),
    0,
  );
  const rank = GARAGE_RANKS[rankIndex];
  const nextRank = GARAGE_RANKS[rankIndex + 1];

  return {
    level: rank.level,
    tierTitle: rank.title,
    currentThreshold: rank.minVehicles,
    nextThreshold: nextRank?.minVehicles ?? null,
    progress: nextRank ? count - rank.minVehicles : 0,
    progressTarget: nextRank ? nextRank.minVehicles - rank.minVehicles : 0,
  };
}

/** Le palier de l'écurie doit compter les cartes différentes réellement détenues. */
export function getUniqueOwnedVehicleCount(
  rows: readonly { card_id?: string | null; count?: number | null }[],
): number {
  return new Set(
    rows.filter((row) => row.card_id && Number(row.count ?? 0) > 0).map((row) => row.card_id),
  ).size;
}
