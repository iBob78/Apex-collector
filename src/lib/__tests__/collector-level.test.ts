import { calculateCollectorLevel } from '@/lib/collector-level';

describe('calculateCollectorLevel', () => {
  it('starts at level one with no collection progress', () => {
    expect(calculateCollectorLevel(0, 0, 0)).toEqual({
      points: 0,
      level: 1,
      progress: 0,
      pointsToNextLevel: 10,
    });
  });

  it('counts unique vehicles, circuits, and claimed achievements separately from competition results', () => {
    expect(calculateCollectorLevel(4, 3, 1)).toEqual({
      points: 12,
      level: 2,
      progress: 2,
      pointsToNextLevel: 8,
    });
  });

  it('counts unique drivers as collection progress', () => {
    expect(calculateCollectorLevel(0, 0, 0, 10)).toEqual({
      points: 10,
      level: 2,
      progress: 0,
      pointsToNextLevel: 10,
    });
  });

  it('does not produce negative progress for invalid negative inputs', () => {
    expect(calculateCollectorLevel(-3, 2, -1)).toEqual({
      points: 2,
      level: 1,
      progress: 2,
      pointsToNextLevel: 8,
    });
  });
});
