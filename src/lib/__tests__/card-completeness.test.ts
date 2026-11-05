import { getIncompleteVehicleCardFields } from '@/lib/card-completeness';

describe('getIncompleteVehicleCardFields', () => {
  it('lists missing identity, rarity, image, and vehicle specification data', () => {
    expect(getIncompleteVehicleCardFields({
      make: 'Acura',
      model: 'NSX',
      year: 2020,
      rarity: null,
      image_url: '',
      power_hp: null,
      torque_nm: 500,
      max_speed_kmh: 0,
      weight_t: 1.7,
    })).toEqual(['rareté', 'source explicite de l’image', 'puissance', 'vitesse maximale']);
  });

  it('returns no warnings when all tracked fields are present', () => {
    expect(getIncompleteVehicleCardFields({
      make: 'Porsche',
      model: '911',
      year: 2024,
      rarity: 'Legend',
      image_url: '/cards/porsche-911.jpg',
      power_hp: 520,
      torque_nm: 465,
      max_speed_kmh: 315,
      weight_t: 1.5,
    })).toEqual([]);
  });
});
