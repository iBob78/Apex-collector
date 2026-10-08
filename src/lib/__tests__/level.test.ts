import { getCardLevel, getLevelProgress, LEVEL_THRESHOLDS } from '../level';

describe('card levels', () => {
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
  ])('assigns level %i at the expected card count', (count, expectedLevel) => {
    expect(getCardLevel(count)).toBe(expectedLevel);
  });

  it('uses the new thresholds for levels 6 through 8', () => {
    expect(LEVEL_THRESHOLDS.LEVEL_6).toBe(100);
    expect(LEVEL_THRESHOLDS.LEVEL_7).toBe(200);
    expect(LEVEL_THRESHOLDS.LEVEL_8).toBe(500);
    expect(LEVEL_THRESHOLDS.LEVEL_9).toBe(1000);
    expect(getCardLevel(199)).toBe(6);
    expect(getCardLevel(499)).toBe(7);
    expect(getCardLevel(999)).toBe(8);
  });

  it('tracks progress through the new levels and caps at level 9', () => {
    expect(getLevelProgress(150)).toEqual({
      currentLevel: 6,
      count: 150,
      nextThreshold: 200,
      progress: 50,
    });
    expect(getLevelProgress(750)).toEqual({
      currentLevel: 8,
      count: 750,
      nextThreshold: 1000,
      progress: 50,
    });
    expect(getLevelProgress(1000)).toEqual({
      currentLevel: 9,
      count: 1000,
      nextThreshold: null,
      progress: 100,
    });
  });
});
