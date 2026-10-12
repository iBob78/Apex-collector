export const LEVEL_THRESHOLDS = {
    LEVEL_0: 1,
    LEVEL_1: 2,
    LEVEL_2: 5,
    LEVEL_3: 10,
    LEVEL_4: 25,
    LEVEL_5: 50,
    LEVEL_6: 100,
    LEVEL_7: 200,
    LEVEL_8: 500,
    LEVEL_9: 1000,
} as const;

const LEVEL_THRESHOLD_VALUES = Object.values(LEVEL_THRESHOLDS);

export const LEVEL_UPGRADE_PRICES = [
    0,
    250,
    500,
    1_000,
    2_000,
    3_000,
    5_000,
    10_000,
    20_000,
    50_000,
] as const;

export function getHighestUnlockedLevel(count: number): number {
    return LEVEL_THRESHOLD_VALUES.reduce(
        (highestLevel, requiredCopies, level) => count >= requiredCopies ? level : highestLevel,
        -1,
    );
}

export function getNextLevelUnlock(count: number, currentLevel: number) {
    const nextLevel = currentLevel + 1;
    const requiredCopies = LEVEL_THRESHOLD_VALUES[nextLevel];

    if (requiredCopies === undefined) return null;

    return {
        nextLevel,
        requiredCopies,
        price: LEVEL_UPGRADE_PRICES[nextLevel]!,
        unlocked: count >= requiredCopies,
        copiesRemaining: Math.max(requiredCopies - count, 0),
    };
}
