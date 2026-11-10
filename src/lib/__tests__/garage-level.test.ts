import { getGarageProgress, getUniqueOwnedVehicleCount } from '@/lib/garage-level';

describe('getGarageProgress', () => {
  it.each([
    [0, 1, 0, 'Écurie débutante'],
    [9, 1, 9, 'Écurie débutante'],
    [10, 2, 0, 'Écurie débutante'],
    [40, 5, 0, 'Écurie amateur'],
    [90, 10, 0, 'Écurie confirmée'],
    [190, 20, 0, 'Écurie professionnelle'],
    [490, 50, 0, 'Écurie légendaire'],
  ])('calculates level and title for %i unique vehicles', (vehicles, level, progress, tierTitle) => {
    expect(getGarageProgress(vehicles)).toEqual({ level, progress, tierTitle });
  });

  it('clamps a negative collection count to zero', () => {
    expect(getGarageProgress(-1)).toEqual({
      level: 1,
      progress: 0,
      tierTitle: 'Écurie débutante',
    });
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
