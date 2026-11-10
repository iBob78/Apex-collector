const GARAGE_TIER_MILESTONES = [
  { level: 50, title: 'Écurie légendaire' },
  { level: 20, title: 'Écurie professionnelle' },
  { level: 10, title: 'Écurie confirmée' },
  { level: 5, title: 'Écurie amateur' },
  { level: 1, title: 'Écurie débutante' },
] as const;

export function getGarageProgress(uniqueVehicles: number) {
  const count = Math.max(0, uniqueVehicles);
  const level = Math.floor(count / 10) + 1;
  const progress = count % 10;
  const tier = GARAGE_TIER_MILESTONES.find((milestone) => level >= milestone.level)!;

  return {
    level,
    progress,
    tierTitle: tier.title,
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
