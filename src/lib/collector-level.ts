export const COLLECTOR_POINTS_PER_LEVEL = 10;
export const CLAIMED_ACHIEVEMENT_POINTS = 5;

export function calculateCollectorLevel(
  uniqueVehicles: number,
  uniqueCircuits: number,
  claimedAchievements: number,
  uniqueDrivers = 0,
) {
  const points =
    Math.max(0, uniqueVehicles) +
    Math.max(0, uniqueCircuits) +
    Math.max(0, uniqueDrivers) +
    Math.max(0, claimedAchievements) * CLAIMED_ACHIEVEMENT_POINTS;
  const progress = points % COLLECTOR_POINTS_PER_LEVEL;

  return {
    points,
    level: Math.floor(points / COLLECTOR_POINTS_PER_LEVEL) + 1,
    progress,
    pointsToNextLevel: COLLECTOR_POINTS_PER_LEVEL - progress,
  };
}
