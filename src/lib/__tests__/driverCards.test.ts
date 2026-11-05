import { getDriverAgeAtCardYear } from '../driverCards';

describe('getDriverAgeAtCardYear', () => {
  it('calculates the age for the card year', () => {
    expect(getDriverAgeAtCardYear('1985-09-17', 2025)).toBe(40);
  });

  it('returns null when the birth date or year is missing or invalid', () => {
    expect(getDriverAgeAtCardYear(null, 2025)).toBeNull();
    expect(getDriverAgeAtCardYear('2000-01-01', null)).toBeNull();
    expect(getDriverAgeAtCardYear('2000-01-01', 1999)).toBeNull();
  });
});
