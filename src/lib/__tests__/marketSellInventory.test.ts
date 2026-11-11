import { buildSellInventory, filterSellInventory } from '../marketSellInventory';

describe('Market sale selector — three categories', () => {
  const vehicles = [
    { card_id: 'shared-id', count: 2, upgrade_level: 1, card: { make: 'Audi', model: 'R8', rarity: 'Rare', is_active: true } },
    { card_id: 'shared-id', count: 1, upgrade_level: 2, card: { make: 'Audi', model: 'R8', rarity: 'Rare', is_active: true } },
    { card_id: 'inactive', count: 3, card: { make: 'Hidden', is_active: false } },
  ];
  const circuits = [
    { circuit_id: 'shared-id', count: 1, card: { id: 'shared-id', circuit_id: null, name: 'Le Mans', country: 'France', rarity: 'Epic' } },
  ];
  const drivers = [
    { driver_id: 'driver-id', count: 2, card: { id: 'db-row-id', driver_id: 'driver-id', name: 'Pilot', country: 'Italy', rarity: 'Legend', is_active: true } },
    { driver_id: 'inactive-driver', count: 1, card: { name: 'Hidden', is_active: false } },
  ];
  const reservations = [
    { category: 'vehicle' as const, card_id: 'shared-id', status: 'active' },
    { category: 'vehicle' as const, card_id: 'shared-id', status: 'active' },
    { category: 'circuit' as const, card_id: 'shared-id', status: 'active' },
    { category: 'driver' as const, card_id: 'driver-id', status: 'cancelled' },
  ];

  it('aggregates duplicate vehicle rows without mixing identical IDs across categories', () => {
    const items = buildSellInventory(vehicles, circuits, drivers, reservations);
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.id)).toEqual([
      'vehicle:shared-id', 'circuit:shared-id', 'driver:driver-id',
    ]);
    expect(items[0]).toMatchObject({ count: 3, availableCount: 1, upgrade_level: 2 });
    expect(items[1]).toMatchObject({ count: 1, availableCount: 0, category: 'circuit' });
    expect(items[2]).toMatchObject({ count: 2, availableCount: 2, category: 'driver' });
    expect(items[1].card).toMatchObject({ category: 'circuit', id: 'shared-id' });
    expect(items[2].card).toMatchObject({ category: 'driver', driver_id: 'driver-id' });
  });

  it('filters only owned catalog items by category, rarity, favorites and search', () => {
    const items = buildSellInventory(vehicles, circuits, drivers, reservations);
    const favorites = new Set(['circuit:shared-id', 'driver:driver-id']);
    const base = { category: 'all' as const, search: '', rarity: 'All' as const, sort: 'name' as const, favoritesOnly: false };
    expect(filterSellInventory(items, base, favorites)).toHaveLength(3);
    expect(filterSellInventory(items, { ...base, category: 'driver' }, favorites).map((item) => item.card.name))
      .toEqual(['Pilot']);
    expect(filterSellInventory(items, { ...base, search: 'france' }, favorites).map((item) => item.category))
      .toEqual(['circuit']);
    expect(filterSellInventory(items, { ...base, rarity: 'Epic' }, favorites).map((item) => item.category))
      .toEqual(['circuit']);
    expect(filterSellInventory(items, { ...base, favoritesOnly: true }, favorites).map((item) => item.category))
      .toEqual(['circuit', 'driver']);
  });

  it('sorts by rarity and groups vehicles ahead of other categories by make', () => {
    const items = buildSellInventory(vehicles, circuits, drivers, []);
    const base = { category: 'all' as const, search: '', rarity: 'All' as const, sort: 'rarity' as const, favoritesOnly: false };
    expect(filterSellInventory(items, base, new Set()).map((item) => item.category))
      .toEqual(['driver', 'circuit', 'vehicle']);
    expect(filterSellInventory(items, { ...base, sort: 'make-asc' }, new Set())[0].category)
      .toBe('vehicle');
  });

  it('sorts by total copies owned in both directions, including reserved copies', () => {
    const items = buildSellInventory(vehicles, circuits, drivers, reservations);
    const base = { category: 'all' as const, search: '', rarity: 'All' as const, sort: 'count-desc' as const, favoritesOnly: false };
    // Vehicle has 3 copies (only 1 available); driver has 2; circuit has 1 (none available).
    expect(filterSellInventory(items, base, new Set()).map((item) => [item.category, item.count]))
      .toEqual([['vehicle', 3], ['driver', 2], ['circuit', 1]]);
    expect(filterSellInventory(items, { ...base, sort: 'count-asc' }, new Set())
      .map((item) => [item.category, item.count]))
      .toEqual([['circuit', 1], ['driver', 2], ['vehicle', 3]]);
  });
});
