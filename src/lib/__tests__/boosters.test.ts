import { drawBoosterCards, PACKS, getPackImageUrl } from '../boosters';

describe('Booster pack assets', () => {
  it('uses the Supabase booster asset paths and includes the expected pack slugs', () => {
    expect(PACKS.common.imageUrl).toBe('assets/boosters/common.jpg');
    expect(PACKS.uncommon.imageUrl).toBe('assets/boosters/uncommon.jpg');
    expect(PACKS.rare.imageUrl).toBe('assets/boosters/rare.jpg');
    expect(PACKS.ultrarare.imageUrl).toBe('assets/boosters/ultrarare.jpg');
    expect(PACKS.prototype.imageUrl).toBe('assets/boosters/prototype.jpg');
    expect(PACKS.mythic.imageUrl).toBe('assets/boosters/mythic.jpg');
    expect(PACKS).toHaveProperty('common');
    expect(PACKS).toHaveProperty('uncommon');
    expect(PACKS).toHaveProperty('rare');
    expect(PACKS).toHaveProperty('ultrarare');
    expect(PACKS).toHaveProperty('prototype');
    expect(PACKS).toHaveProperty('mythic');
  });

  it('resolves a valid image URL for a pack slug', () => {
    expect(getPackImageUrl('common')).toContain('/assets/boosters/common.jpg');
    expect(getPackImageUrl('mythic')).toContain('/assets/boosters/mythic.jpg');
  });
});

describe('Booster card draws', () => {
  it('guarantees a circuit in every pack while preserving its rarity', () => {
    const cards = drawBoosterCards(
      'common',
      [{ id: 'vehicle-common', rarity: 'Common' }],
      [{ id: 'circuit-common', rarity: 'Common' }],
      6,
      () => 0.99
    );

    expect(cards).toHaveLength(6);
    expect(cards.filter((card) => card.category === 'circuit')).toHaveLength(1);
    expect(cards[0]).toEqual({ id: 'circuit-common', rarity: 'Common', category: 'circuit' });
  });

  it('draws circuits with missing rarity and assigns a supported pack rarity', () => {
    const cards = drawBoosterCards(
      'common',
      [],
      [{ id: 'unclassified-circuit', rarity: null }],
      6,
      () => 0.99
    );

    expect(cards).toHaveLength(6);
    expect(cards.every((card) => card.category === 'circuit')).toBe(true);
    expect(cards.every((card) => PACKS.common.probabilities[card.rarity as keyof typeof PACKS.common.probabilities] > 0)).toBe(true);
  });

  it('fails before payment when no compatible circuit is available', () => {
    expect(() => drawBoosterCards('common', [{ id: 'vehicle-common', rarity: 'Common' }], [], 1))
      .toThrow('Aucune carte circuit disponible');
  });
});
