export const LEVEL_THRESHOLDS = {
    LEVEL_0: 1,  // Base
    LEVEL_1: 2,  // 1 Doublon
    LEVEL_2: 5,  // 4 Doublons
    LEVEL_3: 10,
    LEVEL_4: 25,
    LEVEL_5: 50,
} as const;

export function getCardLevel(count: number): number {
    let lvl = 0;
    if (count >= LEVEL_THRESHOLDS.LEVEL_5) lvl = 5;
    else if (count >= LEVEL_THRESHOLDS.LEVEL_4) lvl = 4;
    else if (count >= LEVEL_THRESHOLDS.LEVEL_3) lvl = 3;
    else if (count >= LEVEL_THRESHOLDS.LEVEL_2) lvl = 2;
    else if (count >= LEVEL_THRESHOLDS.LEVEL_1) lvl = 1;
    else lvl = 0;

    if (count > 1) {
        console.log(`[Level Logic] Count: ${count}, Result Lvl: ${lvl}`);
    }
    return lvl;
}

export function getLevelProgress(count: number): { currentLevel: number; count: number; nextThreshold: number | null; progress: number } {
    const level = getCardLevel(count);

    if (level === 5) {
        return { currentLevel: 5, count, nextThreshold: null, progress: 100 };
    }

    const nextThreshold = level === 0 ? LEVEL_THRESHOLDS.LEVEL_1 :
        level === 1 ? LEVEL_THRESHOLDS.LEVEL_2 :
            level === 2 ? LEVEL_THRESHOLDS.LEVEL_3 :
                level === 3 ? LEVEL_THRESHOLDS.LEVEL_4 :
                    LEVEL_THRESHOLDS.LEVEL_5;

    const currentLevelThreshold = level === 0 ? LEVEL_THRESHOLDS.LEVEL_0 :
        level === 1 ? LEVEL_THRESHOLDS.LEVEL_1 :
            level === 2 ? LEVEL_THRESHOLDS.LEVEL_2 :
                level === 3 ? LEVEL_THRESHOLDS.LEVEL_3 :
                    LEVEL_THRESHOLDS.LEVEL_4;

    const progress = Math.min(100, Math.floor(((count - currentLevelThreshold) / (nextThreshold - currentLevelThreshold)) * 100));

    return { currentLevel: level, count, nextThreshold, progress };
}
