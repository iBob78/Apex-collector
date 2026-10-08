export const LEVEL_THRESHOLDS = {
    LEVEL_0: 1,  // Base
    LEVEL_1: 2,  // 1 Doublon
    LEVEL_2: 5,  // 4 Doublons
    LEVEL_3: 10,
    LEVEL_4: 25,
    LEVEL_5: 50,
    LEVEL_6: 100,
    LEVEL_7: 200,
    LEVEL_8: 500,
    LEVEL_9: 1000,
} as const;

const LEVEL_THRESHOLD_VALUES = [
    LEVEL_THRESHOLDS.LEVEL_0,
    LEVEL_THRESHOLDS.LEVEL_1,
    LEVEL_THRESHOLDS.LEVEL_2,
    LEVEL_THRESHOLDS.LEVEL_3,
    LEVEL_THRESHOLDS.LEVEL_4,
    LEVEL_THRESHOLDS.LEVEL_5,
    LEVEL_THRESHOLDS.LEVEL_6,
    LEVEL_THRESHOLDS.LEVEL_7,
    LEVEL_THRESHOLDS.LEVEL_8,
    LEVEL_THRESHOLDS.LEVEL_9,
];

export function getCardLevel(count: number): number {
    let lvl = LEVEL_THRESHOLD_VALUES.length - 1;
    while (lvl > 0 && count < LEVEL_THRESHOLD_VALUES[lvl]) {
        lvl--;
    }

    if (count > 1) {
        console.log(`[Level Logic] Count: ${count}, Result Lvl: ${lvl}`);
    }
    return lvl;
}

export function getLevelProgress(count: number): { currentLevel: number; count: number; nextThreshold: number | null; progress: number } {
    const level = getCardLevel(count);

    if (level === LEVEL_THRESHOLD_VALUES.length - 1) {
        return { currentLevel: level, count, nextThreshold: null, progress: 100 };
    }

    const currentLevelThreshold = LEVEL_THRESHOLD_VALUES[level];
    const nextThreshold = LEVEL_THRESHOLD_VALUES[level + 1];

    const progress = Math.min(100, Math.floor(((count - currentLevelThreshold) / (nextThreshold - currentLevelThreshold)) * 100));

    return { currentLevel: level, count, nextThreshold, progress };
}
