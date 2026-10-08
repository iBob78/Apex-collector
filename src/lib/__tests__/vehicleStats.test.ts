import { calculateVehicleIP } from '../vehicleStats';

describe('calculateVehicleIP', () => {
  it('calculates IP consistently for kilogram and tonne weights', () => {
    expect(calculateVehicleIP(690, 1040)).toBe(663);
    expect(calculateVehicleIP(690, 1.04)).toBe(663);
  });

  it('returns zero when power or weight is missing', () => {
    expect(calculateVehicleIP(0, 1040)).toBe(0);
    expect(calculateVehicleIP(690, null)).toBe(0);
  });
});
