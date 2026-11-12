import { getGarageProgress, getUniqueOwnedVehicleCount } from '@/lib/garage-level';

describe('getGarageProgress', () => {
  it.each([
    // count, rank, title, current threshold, next threshold, progress, target
    [0, 0, 'Non classé', 0, 10, 0, 10],
    [9, 0, 'Non classé', 0, 10, 9, 10],
    [10, 1, 'Rookie', 10, 50, 0, 40],
    [49, 1, 'Rookie', 10, 50, 39, 40],
    [50, 3, 'Débutant', 50, 100, 0, 50],
    [99, 3, 'Débutant', 50, 100, 49, 50],
    [100, 4, 'Amateur', 100, 200, 0, 100],
    [199, 4, 'Amateur', 100, 200, 99, 100],
    [200, 5, 'Confirmé', 200, 500, 0, 300],
    [499, 5, 'Confirmé', 200, 500, 299, 300],
    [500, 6, 'Collectionneur', 500, 1000, 0, 500],
    [999, 6, 'Collectionneur', 500, 1000, 499, 500],
    [1000, 7, 'Professionnel', 1000, 2000, 0, 1000],
    [1999, 7, 'Professionnel', 1000, 2000, 999, 1000],
    [2000, 8, 'Célèbre', 2000, 5000, 0, 3000],
    [4999, 8, 'Célèbre', 2000, 5000, 2999, 3000],
    [5000, 9, 'Légendaire', 5000, null, 0, 0],
    [10000, 9, 'Légendaire', 5000, null, 0, 0],
  ])('calculates correct rank and progression for %i unique vehicles', (
    vehicles, level, title, currentThreshold, nextThreshold, progress, progressTarget,
  ) => {
    expect(getGarageProgress(vehicles as number)).toEqual({
      level,
      tierTitle: title,
      currentThreshold,
      nextThreshold,
      progress,
      progressTarget,
    });
  });

  it('clamps invalid and negative collection counts to zero', () => {
    expect(getGarageProgress(-1)).toEqual(getGarageProgress(0));
    expect(getGarageProgress(Number.NaN)).toEqual(getGarageProgress(0));
  });
});

describe('getUniqueOwnedVehicleCount', () => {
  it('ignores duplicate ownership rows and missing or empty cards', () => {
    expect(getUniqueOwnedVehicleCount([
      { card_id: 'a', count: 1 },
      { card_id: 'a', count: 2 },
      { card_id: 'b', count: 1 },
      { card_id: 'c', count: 0 },
      { card_id: null, count: 1 },
    ])).toBe(2);
  });
});
