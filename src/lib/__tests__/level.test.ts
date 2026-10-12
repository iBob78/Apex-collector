import { getHighestUnlockedLevel, getNextLevelUnlock, LEVEL_THRESHOLDS, LEVEL_UPGRADE_PRICES } from '../level';

describe('card level unlocks', () => {
  it.each([
    [1, 0],
    [2, 1],
    [5, 2],
    [10, 3],
    [25, 4],
    [50, 5],
    [100, 6],
    [200, 7],
    [500, 8],
    [1000, 9],
  ])('unlocks level %i at the expected card count', (count, expectedLevel) => {
    expect(getHighestUnlockedLevel(count)).toBe(expectedLevel);
  });

  it('uses the new thresholds for levels 6 through 8', () => {
    expect(LEVEL_THRESHOLDS.LEVEL_6).toBe(100);
    expect(LEVEL_THRESHOLDS.LEVEL_7).toBe(200);
    expect(LEVEL_THRESHOLDS.LEVEL_8).toBe(500);
    expect(LEVEL_THRESHOLDS.LEVEL_9).toBe(1000);
    expect(getHighestUnlockedLevel(199)).toBe(6);
    expect(getHighestUnlockedLevel(499)).toBe(7);
    expect(getHighestUnlockedLevel(999)).toBe(8);
  });

  it('unlocks only the next unpurchased level after reaching its copy threshold', () => {
    expect(getNextLevelUnlock(1, 0)).toEqual({
      nextLevel: 1,
      requiredCopies: 2,
      price: 250,
      unlocked: false,
      copiesRemaining: 1,
    });
    expect(getNextLevelUnlock(5, 1)).toEqual({
      nextLevel: 2,
      requiredCopies: 5,
      price: 500,
      unlocked: true,
      copiesRemaining: 0,
    });
    expect(getNextLevelUnlock(1000, 9)).toBeNull();
  });

  it.each([
    [3, 1_000],
    [4, 2_000],
    [5, 3_000],
    [6, 5_000],
    [7, 10_000],
    [8, 20_000],
    [9, 50_000],
  ])('sets the level %i purchase price to %i AP', (level, price) => {
    expect(LEVEL_UPGRADE_PRICES[level]).toBe(price);
  });
});
