/**
 * Calculates the total XP based on collection statistics.
 * Formula: Total Cards * 2 + Legendary Cards * 5
 */
export function calculateTotalXP(stats: { totalCards: number; legendaryCards: number }): number {
    return stats.totalCards * 2 + stats.legendaryCards * 5;
}

/**
 * Calculates the Player Level and progress to next level based on XP.
 * Formula: Level = floor(sqrt(XP / 10))
 */
export function calculatePlayerLevel(xp: number): { level: number; progress: number; currentXP: number; nextLevelXP: number } {
    const lvl = Math.floor(Math.sqrt(xp / 10));
    const nextXP = (lvl + 1) ** 2 * 10;
    const curXP = lvl ** 2 * 10;
    // Prevent division by zero if nextXP == curXP (should not happen with this formula for lvl >= 0)
    const progress = nextXP === curXP ? 100 : Math.min(((xp - curXP) / (nextXP - curXP)) * 100, 100);

    return {
        level: lvl,
        progress,
        currentXP: curXP,
        nextLevelXP: nextXP
    };
}
