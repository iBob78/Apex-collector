import { normalizeBattleVehicle, type BattleVehicleSource } from './engine';

/** Les mêmes types de tri que dans la collection ; seules les voitures éligibles sont proposées. */
export type BattleSelectionSort =
  | 'name'
  | 'make-asc'
  | 'make-desc'
  | 'ip-desc'
  | 'ip-asc'
  | 'level-asc'
  | 'level-desc'
  | 'rarity'
  | 'newest';

export type BattleSelectionVehicle = BattleVehicleSource & {
  make: string | null;
  model: string | null;
  name: string | null;
  year: string | number | null;
  rarity: string;
  created_at?: string | null;
};

export type BattleSelectionFilters = {
  query: string;
  rarity: string;
  favoritesOnly: boolean;
  favoriteCardIds: ReadonlySet<string>;
  sortBy: BattleSelectionSort;
  levelsByCardId: Readonly<Record<string, number>>;
};

export const BATTLE_RARITIES = [
  'Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon',
] as const;

const rarityRank = new Map<string, number>(BATTLE_RARITIES.map((rarity, index) => [rarity, index]));

export function getBattleVehicleName(card: BattleSelectionVehicle): string {
  return [card.make, card.model].filter(Boolean).join(' ').trim() || card.name || 'Véhicule';
}

function levelOf(card: BattleSelectionVehicle, levels: Readonly<Record<string, number>>): number {
  return levels[card.card_id.toLowerCase()] ?? 0;
}

function dateAsNumber(value: string | null | undefined): number {
  const timestamp = value ? Date.parse(value) : NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

/** Ne modifie jamais la sélection de dix cartes ni les objets en entrée. */
export function filterAndSortBattleVehicles<T extends BattleSelectionVehicle>(
  vehicles: readonly T[],
  filters: BattleSelectionFilters,
): T[] {
  const query = filters.query.trim().toLocaleLowerCase('fr');
  const result = vehicles.filter((vehicle) => {
    if (filters.favoritesOnly && !filters.favoriteCardIds.has(vehicle.card_id.toLowerCase())) return false;
    if (filters.rarity !== 'All' && vehicle.rarity !== filters.rarity) return false;
    if (!query) return true;
    return [vehicle.make, vehicle.model, vehicle.name, vehicle.year]
      .some((value) => String(value ?? '').toLocaleLowerCase('fr').includes(query));
  });

  return result.sort((a, b) => {
    let difference = 0;
    switch (filters.sortBy) {
      case 'make-asc':
        difference = (a.make || a.name || '').localeCompare(b.make || b.name || '', 'fr', { sensitivity: 'base' });
        break;
      case 'make-desc':
        difference = (b.make || b.name || '').localeCompare(a.make || a.name || '', 'fr', { sensitivity: 'base' });
        break;
      case 'ip-asc':
        difference = normalizeBattleVehicle(a).stats.ip - normalizeBattleVehicle(b).stats.ip;
        break;
      case 'ip-desc':
        difference = normalizeBattleVehicle(b).stats.ip - normalizeBattleVehicle(a).stats.ip;
        break;
      case 'level-asc':
        difference = levelOf(a, filters.levelsByCardId) - levelOf(b, filters.levelsByCardId);
        break;
      case 'level-desc':
        difference = levelOf(b, filters.levelsByCardId) - levelOf(a, filters.levelsByCardId);
        break;
      case 'rarity':
        difference = (rarityRank.get(b.rarity) ?? -1) - (rarityRank.get(a.rarity) ?? -1);
        break;
      case 'newest':
        difference = dateAsNumber(b.created_at) - dateAsNumber(a.created_at);
        break;
      default:
        break;
    }

    return difference || getBattleVehicleName(a).localeCompare(getBattleVehicleName(b), 'fr');
  });
}
