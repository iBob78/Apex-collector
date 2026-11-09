import { drawBoosterCards, PACKS, getPackImageUrl, getFirstTimeBoosterCardIndices, getBoosterCardIdentity, getDailyLoginPackSlug } from '../boosters';

describe('Booster pack assets', () => {
  it('assigns increasingly valuable packs across the seven-day login streak', () => {
    expect(Array.from({ length: 7 }, (_, index) => getDailyLoginPackSlug(index + 1))).toEqual([
      'common', 'uncommon', 'rare', 'ultrarare', 'prototype', 'mythic', 'carbon',
    ]);
    expect(getDailyLoginPackSlug(0)).toBeNull();
    expect(getDailyLoginPackSlug(8)).toBeNull();
  });

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

  it('does not draw inactive vehicles', () => {
    expect(() => drawBoosterCards(
      'common',
      [{ id: 'inactive-vehicle', rarity: 'Common', is_active: false }],
      [],
      1,
    )).toThrow('Aucune carte disponible dans le catalogue du booster');
  });

  it('excludes vehicles disabled for boosters while keeping eligible circuits available', () => {
    const cards = drawBoosterCards(
    'common',
    [{ id: 'booster-disabled-vehicle', rarity: 'Common', booster_enabled: false }],
    [{ id: 'circuit-common', rarity: 'Common' }],
    6,
    () => 0.99,
    );

    expect(cards).toHaveLength(6);
    expect(cards.every((card) => card.category === 'circuit')).toBe(true);
    expect(cards.some((card) => card.id === 'booster-disabled-vehicle')).toBe(false);
  });

  it('includes vehicles without a supported rarity and assigns the rarity drawn from the pack', () => {
    const cards = drawBoosterCards(
      'common',
      [{ id: 'acura-without-rarity', make: 'Acura', rarity: null }],
      [{ id: 'circuit-common', rarity: 'Common' }],
      2,
      (() => {
        const values = [0, 0, 0, 0, 0.99, 0];
        return () => values.shift() ?? 0;
      })(),
    );

    expect(cards).toHaveLength(2);
    expect(cards[1]).toMatchObject({
      id: 'acura-without-rarity',
      make: 'Acura',
      rarity: 'Common',
      category: 'vehicle',
    });
  });

  it('draws drivers at the configured per-pack circuit drop rate', () => {
    const cards = drawBoosterCards(
      'common',
      [{ id: 'vehicle-common', rarity: 'Common' }],
      [{ id: 'circuit-common', rarity: 'Common' }],
      2,
      (() => {
        const values = [0, 0, 0, 0.15, 0];
        return () => values.shift() ?? 0;
      })(),
      [{ id: 'driver-row', driver_id: 'driver-card', rarity: 'Common' }],
    );

    expect(cards[1]).toMatchObject({
      driver_id: 'driver-card',
      category: 'driver',
      rarity: 'Common',
    });
  });

  it('does not draw inactive or booster-disabled drivers', () => {
    const cards = drawBoosterCards(
      'common',
      [{ id: 'vehicle-common', rarity: 'Common' }],
      [{ id: 'circuit-common', rarity: 'Common' }],
      2,
      () => 0.15,
      [
        { id: 'inactive-driver', rarity: 'Common', is_active: false },
        { id: 'excluded-driver', rarity: 'Common', booster_enabled: false },
      ],
    );

    expect(cards[1]).toMatchObject({ id: 'vehicle-common', category: 'vehicle' });
  });

  it('assigns each unclassified vehicle to only one rarity pool per pack', () => {
    const cards = drawBoosterCards(
      'mythic',
      [
        { id: 'unclassified-acura', make: 'Acura', rarity: null },
        { id: 'icon-ferrari', make: 'Ferrari', rarity: 'Icon' },
      ],
      [{ id: 'common-circuit', rarity: 'Common' }],
      2,
      (() => {
        const values = [0, 0, 0, 0.99, 0];
        return () => values.shift() ?? 0;
      })(),
    );

    expect(cards[1]).toMatchObject({
      id: 'icon-ferrari',
      rarity: 'Icon',
      category: 'vehicle',
    });
  });
});

describe('First-time booster discoveries', () => {
  it('resolves collection IDs and categories for persisted discoveries', () => {
    expect(getBoosterCardIdentity({ id: 'database-row', card_id: 'CAR-ID', category: 'vehicle' }))
      .toEqual({ category: 'vehicle', cardId: 'car-id' });
    expect(getBoosterCardIdentity({ id: 'database-row', circuit_id: 'TRACK-ID', category: 'circuit' }))
      .toEqual({ category: 'circuit', cardId: 'track-id' });
    expect(getBoosterCardIdentity({ id: 'database-row', driver_id: 'DRIVER-ID', category: 'driver' }))
      .toEqual({ category: 'driver', cardId: 'driver-id' });
    expect(getBoosterCardIdentity({ category: 'vehicle' })).toBeNull();
  });

  it('marks only the first copy absent from the collection, including circuits', () => {
    const cards = [
      { card_id: 'NEW-CAR', id: 'db-car', category: 'vehicle' },
      { card_id: 'new-car', id: 'db-car', category: 'vehicle' },
      { id: 'EXISTING-CAR', category: 'vehicle' },
      { id: 'NEW-TRACK', category: 'circuit' },
      { id: 'existing-track', category: 'circuit' },
      { id: 'NEW-DRIVER', driver_id: 'driver-new', category: 'driver' },
      { id: 'existing-driver', driver_id: 'driver-owned', category: 'driver' },
    ];
    expect([...getFirstTimeBoosterCardIndices(
      cards,
      [{ card_id: 'existing-car', count: 2 }],
      [{ circuit_id: 'EXISTING-TRACK', count: 1 }],
      [true, true, true, true, true, true, true],
      [{ driver_id: 'DRIVER-OWNED', count: 1 }],
    )]).toEqual([0, 3, 5]);
  });

  it('does not label failed additions or extra copies from the same booster', () => {
    const cards = [
      { id: 'same', category: 'vehicle' },
      { id: 'same', category: 'vehicle' },
      { id: 'same', category: 'vehicle' },
      { id: 'unsaved-circuit', category: 'circuit' },
    ];
    expect([...getFirstTimeBoosterCardIndices(
      cards, [], [], [false, true, true, false],
    )]).toEqual([1]);
  });

  it('recognizes zero-count cards as new and separates circuit from vehicle IDs', () => {
    const cards = [
      { id: 'shared-id', category: 'vehicle' },
      { id: 'shared-id', category: 'circuit' },
      { id: 'zero-vehicle', category: 'vehicle' },
    ];
    expect([...getFirstTimeBoosterCardIndices(
      cards,
      [{ card_id: 'shared-id', count: 1 }, { card_id: 'zero-vehicle', count: 0 }],
      [], [true, true, true],
    )]).toEqual([1, 2]);
  });

  it('uses the circuit business ID rather than its database row ID for ownership', () => {
    const cards = [
      { id: 'database-row-owned', circuit_id: 'circuit-owned', category: 'circuit' },
      { id: 'database-row-new', circuit_id: 'circuit-new', category: 'circuit' },
    ];

    expect([...getFirstTimeBoosterCardIndices(
      cards,
      [],
      [{ circuit_id: 'circuit-owned', count: 1 }],
      [true, true],
    )]).toEqual([1]);
  });
});

describe('welcome booster', () => {
  it('draws ten cards using the existing common pack odds', () => {
    const { WELCOME_GIFT_KEY, WELCOME_GIFT_PACK_SLUG, WELCOME_GIFT_CARD_COUNT } = require('../boosters');
    expect(WELCOME_GIFT_KEY).toBe('welcome_2026');
    expect(WELCOME_GIFT_PACK_SLUG).toBe('common');
    expect(WELCOME_GIFT_CARD_COUNT).toBe(10);
    expect(PACKS.common.cardCount).toBe(6); // Regular pack unchanged.
    const cards = drawBoosterCards(
      WELCOME_GIFT_PACK_SLUG,
      [{ id: 'car1', rarity: 'Common' }],
      [{ id: 'circuit1', rarity: 'Common', category: 'circuit' }],
      WELCOME_GIFT_CARD_COUNT,
      () => 0.1,
    );
    expect(cards).toHaveLength(10);
    expect(cards.some(card => card.category === 'circuit')).toBe(true);
  });
});
