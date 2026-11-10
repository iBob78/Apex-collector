import type { CardCategory, Rarity } from '@/types/game';

export type SellCategory = CardCategory | 'all';
export type SellSort = 'name' | 'make-asc' | 'make-desc' | 'ip-desc' | 'ip-asc' | 'level-asc' | 'level-desc' | 'rarity' | 'newest';

export type SellInventoryItem = {
  id: string;
  card_id: string;
  category: CardCategory;
  card: any;
  count: number;
  availableCount: number;
  upgrade_level: number;
};

type OwnedRow = {
  card_id?: string;
  circuit_id?: string;
  driver_id?: string;
  card?: any;
  count?: number;
  upgrade_level?: number;
};

type ExistingListing = {
  status?: string;
  category?: CardCategory;
  card_id?: string;
};

/** The three inventories use three different canonical catalog identifiers. */
export function buildSellInventory(
  vehicles: OwnedRow[],
  circuits: OwnedRow[],
  drivers: OwnedRow[],
  listings: ExistingListing[],
): SellInventoryItem[] {
  const reserved = new Map<string, number>();
  for (const listing of listings) {
    if (listing.status !== 'active' || !listing.card_id) continue;
    const key = `${listing.category || 'vehicle'}:${String(listing.card_id).toLowerCase()}`;
    reserved.set(key, (reserved.get(key) || 0) + 1);
  }

  const inventory = new Map<string, SellInventoryItem>();
  const addRows = (category: CardCategory, rows: OwnedRow[]) => {
    for (const row of rows) {
      if (!row.card || (category !== 'circuit' && row.card.is_active === false)) continue;
      const cardId = category === 'vehicle' ? row.card_id
        : category === 'circuit' ? row.circuit_id : row.driver_id;
      const count = Number(row.count ?? 1);
      if (!cardId || !Number.isFinite(count) || count <= 0) continue;

      const key = `${category}:${String(cardId).toLowerCase()}`;
      const previous = inventory.get(key);
      if (previous) {
        previous.count += count;
        previous.upgrade_level = Math.max(previous.upgrade_level, Number(row.upgrade_level) || 0);
      } else {
        inventory.set(key, {
          id: key,
          card_id: String(cardId),
          category,
          card: { ...row.card, category },
          count,
          availableCount: 0,
          upgrade_level: Number(row.upgrade_level) || 0,
        });
      }
    }
  };
  addRows('vehicle', vehicles);
  addRows('circuit', circuits);
  addRows('driver', drivers);

  return [...inventory.values()].map((item) => ({
    ...item,
    availableCount: Math.max(0, item.count - (reserved.get(item.id) || 0)),
  }));
}

function cardName(card: any): string {
  return `${card.make || ''} ${card.model || card.name || ''}`.trim();
}

function cardIp(card: any): number {
  const power = Number(card.power_hp) || 0;
  const rawWeight = Number(card.weight_t) || 0;
  const weightKg = rawWeight > 50 ? rawWeight : rawWeight * 1000;
  return power > 0 && weightKg > 0 ? Math.floor((power / weightKg) * 1000) : 0;
}

/** Same category, search, rarity, favorites and sort choices as the collection. */
export function filterSellInventory(
  inventory: SellInventoryItem[],
  filters: {
    category: SellCategory;
    search: string;
    rarity: Rarity | 'All';
    sort: SellSort;
    favoritesOnly: boolean;
  },
  favorites: ReadonlySet<string>,
): SellInventoryItem[] {
  const query = filters.search.toLowerCase().trim();
  const result = inventory.filter((item) => {
    const card = item.card;
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.favoritesOnly && !favorites.has(item.id)) return false;
    if (filters.rarity !== 'All' && card.rarity !== filters.rarity) return false;
    if (query && ![card.make, card.model, card.country, card.name]
      .some((value) => String(value || '').toLowerCase().includes(query))) return false;
    return true;
  });

  result.sort((a, b) => {
    if (filters.sort === 'rarity') {
      const order: Record<string, number> = {
        Common: 1, Uncommon: 2, Atypique: 2, Rare: 3,
        'Very rare': 3, Epic: 4, Legend: 5, Mythic: 6, Icon: 7,
      };
      return (order[b.card.rarity] || 0) - (order[a.card.rarity] || 0);
    }
    if (filters.sort === 'newest') {
      return (new Date(b.card.created_at || 0).getTime() || 0)
        - (new Date(a.card.created_at || 0).getTime() || 0);
    }
    if (filters.sort === 'make-asc' || filters.sort === 'make-desc') {
      if (a.category !== b.category && (a.category === 'vehicle' || b.category === 'vehicle')) {
        return a.category === 'vehicle' ? -1 : 1;
      }
      const make = (item: SellInventoryItem) =>
        item.card.make || item.card.manufacturer || item.card.name || '';
      const direction = filters.sort === 'make-asc' ? 1 : -1;
      return direction * make(a).localeCompare(make(b), undefined, { sensitivity: 'base' });
    }
    if (filters.sort === 'ip-desc' || filters.sort === 'ip-asc') {
      return (filters.sort === 'ip-desc' ? -1 : 1) * (cardIp(a.card) - cardIp(b.card));
    }
    if (filters.sort === 'level-asc' || filters.sort === 'level-desc') {
      return (filters.sort === 'level-asc' ? 1 : -1) * (a.upgrade_level - b.upgrade_level);
    }
    return cardName(a.card).localeCompare(cardName(b.card));
  });
  return result;
}
