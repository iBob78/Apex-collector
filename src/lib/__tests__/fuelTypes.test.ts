import { fuelTypes, getFuelTypeInfo } from '../fuelTypes';

describe('fuel types', () => {
  it('defines every supported fuel acronym', () => {
    expect(fuelTypes.map(({ code }) => code)).toEqual([
      'ES', 'GO', 'EL', 'EE', 'EH', 'GL', 'GH', 'E85', 'ET', 'GP', 'GN', 'H2', 'EG', 'EN', 'FG', 'FL',
    ]);
  });

  it.each(fuelTypes)('resolves the $code acronym', (fuelType) => {
    expect(getFuelTypeInfo(fuelType.code)).toEqual(fuelType);
  });

  it.each([
    ['Essence', 'ES'],
    ['Diesel', 'GO'],
    ['Électricité', 'EL'],
    ['GPL', 'GP'],
    ['GNV', 'GN'],
    ['Essence-électricité (hybride rechargeable)', 'EE'],
  ])('maps the existing fuel value %s to %s', (value, code) => {
    expect(getFuelTypeInfo(value)?.code).toBe(code);
  });

  it('returns no badge information for missing or unrecognized values', () => {
    expect(getFuelTypeInfo(null)).toBeNull();
    expect(getFuelTypeInfo('')).toBeNull();
    expect(getFuelTypeInfo('Carburant inconnu')).toBeNull();
  });
});
