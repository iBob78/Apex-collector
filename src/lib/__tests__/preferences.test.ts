import {
  formatDistance,
  formatPower,
  formatSpeed,
  formatTorque,
  formatWeight,
  translate,
} from '../preferences';

describe('site preference formatters', () => {
  it('converts metric speeds and distances to imperial units', () => {
    expect(formatSpeed(100, 'imperial', 'en')).toBe('62 mph');
    expect(formatDistance(10, 'imperial', 'en')).toBe('6.2 mi');
  });

  it('formats power, torque, and weight for both unit systems', () => {
    expect(formatPower(100, 'metric', 'en')).toBe('101 CV');
    expect(formatPower(100, 'metric', 'en', 74.57)).toBe('101 CV');
    expect(formatPower(100, 'imperial', 'en')).toBe('100 HP');
    expect(formatTorque(100, 'imperial', 'en')).toBe('74 lb-ft');
    expect(formatWeight(1.5, 'metric', 'en')).toBe('1,500 kg');
    expect(formatWeight(1.5, 'imperial', 'en')).toBe('3,307 lb');
  });

  it('translates catalog strings and interpolates values', () => {
    expect(translate('en', 'Voulez-vous acheter cette carte pour {price} AP ?', { price: 250 }))
      .toBe('Do you want to buy this card for 250 AP?');
    expect(translate('fr', 'Chaîne inconnue')).toBe('Chaîne inconnue');
  });
});
