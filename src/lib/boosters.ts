import { getPublicImage } from '@/lib/images';

type BoosterRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legend' | 'Icon';

/** Dedicated one-time onboarding gift. Its odds match the common pack, not its identity. */
export const WELCOME_GIFT_KEY = 'welcome_2026';
export const WELCOME_GIFT_PACK_SLUG = 'welcome';
export const WELCOME_GIFT_CARD_COUNT = 10;

export const DAILY_LOGIN_PACKS = [
    'common',
    'uncommon',
    'rare',
    'ultrarare',
    'prototype',
    'mythic',
    'carbon',
] as const;

export function getDailyLoginPackSlug(streakDay: number) {
    if (!Number.isInteger(streakDay) || streakDay < 1 || streakDay > DAILY_LOGIN_PACKS.length) return null;
    return DAILY_LOGIN_PACKS[streakDay - 1];
}

export interface BoosterCatalogCard {
    id?: string;
    card_id?: string;
    circuit_id?: string;
    driver_id?: string;
    rarity?: string | null;
    is_active?: boolean;
    booster_enabled?: boolean;
    category?: 'vehicle' | 'circuit' | 'driver';
    [key: string]: unknown;
}

export type BoosterCardCategory = 'vehicle' | 'circuit' | 'driver';

export function getBoosterCardIdentity(card: BoosterCatalogCard): {
    category: BoosterCardCategory;
    cardId: string;
} | null {
    const category: BoosterCardCategory = card.category === 'driver' || card.driver_id != null
        ? 'driver'
        : card.category === 'circuit' || card.type === 'Circuit' || card.track_name != null
            ? 'circuit'
            : 'vehicle';
    const rawId = category === 'driver'
        ? card.driver_id || card.id
        : category === 'circuit'
            ? card.circuit_id || card.id
            : card.card_id || card.id;
    const cardId = String(rawId ?? '').trim().toLowerCase();

    return cardId ? { category, cardId } : null;
}

export interface PackConfig {
    slug: string;
    name: string;
    price: number;
    cardCount: number;
    circuitDropRate: number;
    description: string;
    color: string;
    imageUrl: string;
    probabilities: Record<BoosterRarity, number>;
}

export const PACKS: Record<string, PackConfig> = {
    welcome: {
        slug: WELCOME_GIFT_PACK_SLUG,
        name: 'Booster de bienvenue',
        description: 'Édition exclusive offerte une seule fois à l’inscription. Dix cartes pour démarrer votre collection.',
        price: 0,
        cardCount: WELCOME_GIFT_CARD_COUNT,
        circuitDropRate: 0.1,
        color: 'from-amber-300 via-orange-500 to-rose-600',
        imageUrl: '/images/boosters/welcome.svg',
        probabilities: {
            Common: 0.60,
            Uncommon: 0.25,
            Rare: 0.10,
            Epic: 0.04,
            Legend: 0.01,
            Icon: 0,
        },
    },
    common: {
        slug: 'common',
        name: 'Pack Commun',
        description: 'Le point d\'entrée idéal. Contient principalement des cartes Standard.',
        price: 250,
        cardCount: 6,
        circuitDropRate: 0.1,
        color: 'from-blue-600 to-blue-800',
        imageUrl: 'assets/boosters/common.jpg',
        probabilities: {
            'Common': 0.60,
            'Uncommon': 0.25,
            'Rare': 0.10,
            'Epic': 0.04,
            'Legend': 0.01,
            'Icon': 0,
        }
    },
    uncommon: {
        slug: 'uncommon',
        name: 'Pack Inhabituel',
        description: 'Un pack équilibré avec une meilleure fréquence de cartes rares.',
        price: 450,
        cardCount: 6,
        circuitDropRate: 0.15,
        color: 'from-cyan-500 to-blue-700',
        imageUrl: 'assets/boosters/uncommon.jpg',
        probabilities: {
            'Common': 0.25,
            'Uncommon': 0.45,
            'Rare': 0.20,
            'Epic': 0.08,
            'Legend': 0.02,
            'Icon': 0,
        }
    },
    rare: {
        slug: 'rare',
        name: 'Pack Rare',
        description: 'Pour les collectionneurs sérieux. Taux de cartes Épiques doublé.',
        price: 750,
        cardCount: 6,
        circuitDropRate: 0.1,
        color: 'from-purple-600 to-purple-900',
        imageUrl: 'assets/boosters/rare.jpg',
        probabilities: {
            'Common': 0.20,
            'Uncommon': 0.30,
            'Rare': 0.30,
            'Epic': 0.15,
            'Legend': 0.05,
            'Icon': 0,
        }
    },
    ultrarare: {
        slug: 'ultrarare',
        name: 'Pack Ultra Rare',
        description: 'Un pack premium orienté vers les cartes de haute performance.',
        price: 1400,
        cardCount: 6,
        circuitDropRate: 0.15,
        color: 'from-fuchsia-600 to-violet-900',
        imageUrl: 'assets/boosters/ultrarare.jpg',
        probabilities: {
            'Common': 0.10,
            'Uncommon': 0.20,
            'Rare': 0.30,
            'Epic': 0.25,
            'Legend': 0.12,
            'Icon': 0.03,
        }
    },
    prototype: {
        slug: 'prototype',
        name: 'Pack Prototype',
        description: 'Une mécanique de tirage tournée vers les pièces exceptionnelles.',
        price: 2200,
        cardCount: 6,
        circuitDropRate: 0.2,
        color: 'from-cyan-500 to-teal-700',
        imageUrl: 'assets/boosters/prototype.jpg',
        probabilities: {
            'Common': 0.08,
            'Uncommon': 0.15,
            'Rare': 0.25,
            'Epic': 0.30,
            'Legend': 0.18,
            'Icon': 0.04,
        }
    },
    mythic: {
        slug: 'mythic',
        name: 'Pack Mythic',
        description: 'Le plus haut niveau de tirage, réservé aux collectionneurs.',
        price: 4500,
        cardCount: 8,
        circuitDropRate: 0.2,
        color: 'from-slate-200 to-slate-800',
        imageUrl: 'assets/boosters/mythic.jpg',
        probabilities: {
            'Common': 0.05,
            'Uncommon': 0.10,
            'Rare': 0.20,
            'Epic': 0.30,
            'Legend': 0.25,
            'Icon': 0.10,
        }
    },
    legend: {
        slug: 'legend',
        name: 'Pack Légendaire',
        description: 'Le luxe absolu. Garanti au moins une carte Rare ou supérieure.',
        price: 2500,
        cardCount: 6,
        circuitDropRate: 0.1,
        color: 'from-yellow-400 to-orange-600',
        imageUrl: 'assets/boosters/legend.jpg',
        probabilities: {
            'Common': 0.05,
            'Uncommon': 0.15,
            'Rare': 0.30,
            'Epic': 0.35,
            'Legend': 0.15,
            'Icon': 0,
        }
    },
    carbon: {
        slug: 'carbon',
        name: 'Pack Carbon',
        description: 'L\'élite ultime. Seul pack contenant des cartes ICON.',
        price: 5000,
        cardCount: 8,
        circuitDropRate: 0.1,
        color: 'from-gray-700 to-black',
        imageUrl: 'assets/boosters/carbon.jpg',
        probabilities: {
            'Common': 0,
            'Uncommon': 0.10,
            'Rare': 0.20,
            'Epic': 0.40,
            'Legend': 0.25,
            'Icon': 0.05,
        }
    }
};

/** Gift-only pack is intentionally excluded from the shop and objective reward catalogue. */
export const SHOP_PACKS: PackConfig[] = Object.values(PACKS).filter((pack) => pack.slug !== WELCOME_GIFT_PACK_SLUG);

export function isPurchasablePackSlug(packSlug: string): boolean {
    return SHOP_PACKS.some((pack) => pack.slug === packSlug);
}

export function getPackImageUrl(packSlug: string): string {
    const pack = PACKS[packSlug] || PACKS.common;
    return getPublicImage(pack.imageUrl) || pack.imageUrl;
}

/**
 * Tirage aléatoire d'une rareté basée sur les probabilités du pack
 */
export function drawRarity(packSlug: string): BoosterRarity {
    const pack = PACKS[packSlug] || PACKS.common;
    const rand = Math.random();
    let cumulative = 0;

    // On trie les raretés pour assurer un ordre de tirage logique (plus rare en premier)
    const raritiesOrder: BoosterRarity[] = ['Icon', 'Legend', 'Epic', 'Rare', 'Uncommon', 'Common'];

    for (const rarity of raritiesOrder) {
        cumulative += pack.probabilities[rarity] || 0;
        if (rand <= cumulative) {
            return rarity;
        }
    }

    return 'Common';
}

export function drawBoosterCards(
    packSlug: string,
    vehicleCards: BoosterCatalogCard[],
    circuitCards: BoosterCatalogCard[],
    count = (PACKS[packSlug] || PACKS.common).cardCount,
    random = Math.random,
    driverCards: BoosterCatalogCard[] = [],
): BoosterCatalogCard[] {
    const pack = PACKS[packSlug] || PACKS.common;
    if (count <= 0) return [];
    vehicleCards = vehicleCards.filter((card) => card.is_active !== false && card.booster_enabled !== false);
    driverCards = driverCards.filter((card) => card.is_active !== false && card.booster_enabled !== false);

    const supportedRarities = (Object.keys(pack.probabilities) as BoosterRarity[]).filter(
        (rarity) => pack.probabilities[rarity] > 0
    );
    const drawRarityFrom = (rarities: BoosterRarity[]) => {
        const totalWeight = rarities.reduce((sum, rarity) => sum + pack.probabilities[rarity], 0);
        let rarityRoll = random() * totalWeight;
        let selectedRarity = rarities[rarities.length - 1];

        for (const rarity of rarities) {
            rarityRoll -= pack.probabilities[rarity];
            if (rarityRoll < 0) {
                selectedRarity = rarity;
                break;
            }
        }

        return selectedRarity;
    };

    const assignMissingRarities = (cards: BoosterCatalogCard[]) => cards.map((card) => ({
        ...card,
        rarity: supportedRarities.includes(card.rarity as BoosterRarity)
            ? card.rarity
            : drawRarityFrom(supportedRarities),
    }));
    const classifiedVehicles = assignMissingRarities(vehicleCards);
    const classifiedCircuits = assignMissingRarities(circuitCards);
    const classifiedDrivers = assignMissingRarities(driverCards);
    const vehiclesForRarity = (rarity: BoosterRarity) =>
        classifiedVehicles.filter((card) => card.rarity === rarity);
    const circuitsForRarity = (rarity: BoosterRarity) =>
        classifiedCircuits.filter((card) => card.rarity === rarity);
    const driversForRarity = (rarity: BoosterRarity) =>
        classifiedDrivers.filter((card) => card.rarity === rarity);
    const availableRarities = supportedRarities.filter(
        (rarity) => vehiclesForRarity(rarity).length > 0
            || circuitsForRarity(rarity).length > 0
            || driversForRarity(rarity).length > 0
    );

    if (availableRarities.length === 0) {
        throw new Error('Aucune carte disponible dans le catalogue du booster.');
    }

    const circuitRarities = availableRarities.filter((rarity) => circuitsForRarity(rarity).length > 0);

    if (circuitRarities.length === 0) {
        throw new Error('Aucune carte circuit disponible dans le catalogue du booster.');
    }

    const results: BoosterCatalogCard[] = [];
    const guaranteedCircuitRarity = drawRarityFrom(circuitRarities);
    const guaranteedCircuitPool = circuitsForRarity(guaranteedCircuitRarity);
    const guaranteedCircuit = guaranteedCircuitPool[Math.floor(random() * guaranteedCircuitPool.length)];
    results.push({
        ...guaranteedCircuit,
        rarity: supportedRarities.includes(guaranteedCircuit.rarity as BoosterRarity)
            ? guaranteedCircuit.rarity
            : guaranteedCircuitRarity,
        category: 'circuit'
    });

    while (results.length < count) {
        const rarity = drawRarityFrom(availableRarities);

        const vehicles = vehiclesForRarity(rarity);
        const circuits = circuitsForRarity(rarity);
        const drivers = driversForRarity(rarity);
        const sourceOptions = [
            { category: 'circuit' as const, cards: circuits, weight: circuits.length ? pack.circuitDropRate : 0 },
            { category: 'driver' as const, cards: drivers, weight: drivers.length ? pack.circuitDropRate : 0 },
            {
                category: 'vehicle' as const,
                cards: vehicles,
                weight: vehicles.length
                    ? Math.max(0, 1
                        - (circuits.length ? pack.circuitDropRate : 0)
                        - (drivers.length ? pack.circuitDropRate : 0))
                    : 0,
            },
        ].filter((option) => option.cards.length > 0 && option.weight > 0);

        const totalWeight = sourceOptions.reduce((sum, option) => sum + option.weight, 0);
        let sourceRoll = random() * totalWeight;
        let selectedSource = sourceOptions[sourceOptions.length - 1];
        for (const option of sourceOptions) {
            sourceRoll -= option.weight;
            if (sourceRoll < 0) {
                selectedSource = option;
                break;
            }
        }

        const selected = selectedSource.cards[Math.floor(random() * selectedSource.cards.length)];
        results.push({
            ...selected,
            rarity: supportedRarities.includes(selected.rarity as BoosterRarity) ? selected.rarity : rarity,
            category: selectedSource.category,
        });
    }

    return results;
}

/** Mark first successful acquisitions only, using ownership before the booster was saved. */
export function getFirstTimeBoosterCardIndices(
    drawnCards: readonly BoosterCatalogCard[],
    ownedVehicles: readonly { card_id?: string | null; count?: number | null }[],
    ownedCircuits: readonly { circuit_id?: string | null; count?: number | null }[],
    savedSuccessfully: readonly boolean[],
    ownedDrivers: readonly { driver_id?: string | null; count?: number | null }[] = [],
): Set<number> {
    const keyFor = (category: 'vehicle' | 'circuit' | 'driver', id: unknown): string | null => {
        const idText = String(id ?? '').trim().toLowerCase();
        return idText ? `${category}:${idText}` : null;
    };
    const seen = new Set<string>();

    for (const row of ownedVehicles) {
        const key = keyFor('vehicle', row.card_id);
        if (key && Number(row.count ?? 1) > 0) seen.add(key);
    }
    for (const row of ownedCircuits) {
        const key = keyFor('circuit', row.circuit_id);
        if (key && Number(row.count ?? 1) > 0) seen.add(key);
    }
    for (const row of ownedDrivers) {
        const key = keyFor('driver', row.driver_id);
        if (key && Number(row.count ?? 1) > 0) seen.add(key);
    }

    const firstTimeIndices = new Set<number>();
    drawnCards.forEach((card, index) => {
        if (!savedSuccessfully[index]) return;

        const identity = getBoosterCardIdentity(card);
        if (!identity) return;
        const key = keyFor(identity.category, identity.cardId);
        if (!key) return;

        if (!seen.has(key)) firstTimeIndices.add(index);
        seen.add(key);
    });

    return firstTimeIndices;
}
