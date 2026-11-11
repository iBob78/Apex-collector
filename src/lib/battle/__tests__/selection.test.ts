import {
  BATTLE_RARITIES,
  type BattleSelectionFilters,
  type BattleSelectionVehicle,
  filterAndSortBattleVehicles,
} from '../selection';

function vehicle(
  id: string,
  patch: Partial<BattleSelectionVehicle> = {},
): BattleSelectionVehicle {
  return {
    card_id: id,
    make: 'Porsche',
    model: id,
    name: 'Porsche ' + id,
    year: 2022,
    rarity: 'Common',
    created_at: '2026-01-01T12:00:00Z',
    power_hp: 300,
    torque_nm: 350,
    max_speed_kmh: 270,
    acceleration_0_100: 4.2,
    weight_t: '1.5',
    ...patch,
  };
}

const vehicles = [
  vehicle('a', { make: 'Ferrari', model: 'F40', rarity: 'Legend', power_hp: 450, weight_t: '1.2', year: 1987, created_at: '2025-10-01T12:00:00Z' }),
  vehicle('b', { make: 'BMW', model: 'M3', rarity: 'Rare', power_hp: 500, weight_t: '1700', year: 2024, created_at: '2026-10-01T12:00:00Z' }),
  vehicle('c', { make: 'Alpine', model: 'A110', rarity: 'Mythic', power_hp: 250, weight_t: '1.1', year: 2020, created_at: '2026-02-01T12:00:00Z' }),
];
const emptyIds = new Set<string>();

function filters(patch: Partial<BattleSelectionFilters> = {}): BattleSelectionFilters {
  return {
    query: '',
    rarity: 'All',
    favoritesOnly: false,
    favoriteCardIds: emptyIds,
    sortBy: 'name',
    levelsByCardId: {},
    ...patch,
  };
}

function ids(patch: Partial<BattleSelectionFilters> = {}) {
  return filterAndSortBattleVehicles(vehicles, filters(patch)).map((card) => card.card_id);
}

describe('Apex Battle — filtres de sélection', () => {
  it('conserve les 9 raretés du catalogue', () => {
    expect(BATTLE_RARITIES).toEqual([
      'Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon',
    ]);
  });

  it('cherche dans marque, modèle, nom et année sans respecter la casse', () => {
    expect(ids({ query: 'ferRaRi' })).toEqual(['a']);
    expect(ids({ query: 'a110' })).toEqual(['c']);
    expect(ids({ query: '2024' })).toEqual(['b']);
    expect(ids({ query: 'aucun' })).toEqual([]);
  });

  it('filtre les favoris et les raretés en même temps', () => {
    expect(ids({
      favoritesOnly: true,
      favoriteCardIds: new Set(['b', 'c']),
      rarity: 'Mythic',
    })).toEqual(['c']);
    expect(ids({ favoritesOnly: true, favoriteCardIds: new Set() })).toEqual([]);
  });

  it('trie les marques dans les deux sens', () => {
    expect(ids({ sortBy: 'make-asc' })).toEqual(['c', 'b', 'a']);
    expect(ids({ sortBy: 'make-desc' })).toEqual(['a', 'b', 'c']);
  });

  it('trie les IP suivant la formule partagée et normalise les kilogrammes', () => {
    // A : floor(450/1200*1000)=375, B : floor(500/1700*1000)=294, C : floor(250/1100*1000)=227
    expect(ids({ sortBy: 'ip-desc' })).toEqual(['a', 'b', 'c']);
    expect(ids({ sortBy: 'ip-asc' })).toEqual(['c', 'b', 'a']);
  });

  it('trie les niveaux sans leur donner de bonus de combat', () => {
    const levelsByCardId = { a: 0, b: 8, c: 3 };
    expect(ids({ sortBy: 'level-asc', levelsByCardId })).toEqual(['a', 'c', 'b']);
    expect(ids({ sortBy: 'level-desc', levelsByCardId })).toEqual(['b', 'c', 'a']);
  });

  it('trie les raretés et les dates de création', () => {
    expect(ids({ sortBy: 'rarity' })).toEqual(['c', 'a', 'b']);
    expect(ids({ sortBy: 'newest' })).toEqual(['b', 'c', 'a']);
  });

  it('n’altère jamais la liste fournie ni les propriétés des cartes', () => {
    const originalOrder = vehicles.map((card) => card.card_id);
    const originalStats = vehicles.map((card) => card.weight_t);
    filterAndSortBattleVehicles(vehicles, filters({ sortBy: 'ip-desc' }));
    expect(vehicles.map((card) => card.card_id)).toEqual(originalOrder);
    expect(vehicles.map((card) => card.weight_t)).toEqual(originalStats);
  });
});
