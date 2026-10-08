import { getPublicImage } from '@/lib/images';
import { Rarity } from '@/types/game';

export interface BoosterCatalogCard {
    id?: string;
    card_id?: string;
    rarity?: string | null;
    [key: string]: unknown;
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
    probabilities: Record<Rarity, number>;
}

export const PACKS: Record<string, PackConfig> = {
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

export function getPackImageUrl(packSlug: string): string {
    const pack = PACKS[packSlug] || PACKS.common;
    return getPublicImage(pack.imageUrl) || pack.imageUrl;
}

/**
 * Tirage aléatoire d'une rareté basée sur les probabilités du pack
 */
export function drawRarity(packSlug: string): Rarity {
    const pack = PACKS[packSlug] || PACKS.common;
    const rand = Math.random();
    let cumulative = 0;

    // On trie les raretés pour assurer un ordre de tirage logique (plus rare en premier)
    const raritiesOrder: Rarity[] = ['Icon', 'Legend', 'Epic', 'Rare', 'Uncommon', 'Common'];

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
    random = Math.random
): BoosterCatalogCard[] {
    const pack = PACKS[packSlug] || PACKS.common;
    if (count <= 0) return [];

    const supportedRarities = (Object.keys(pack.probabilities) as Rarity[]).filter(
        (rarity) => pack.probabilities[rarity] > 0
    );
    const unclassifiedCircuits = circuitCards.filter(
        (card) => !supportedRarities.includes(card.rarity as Rarity)
    );
    const circuitsForRarity = (rarity: Rarity) => [
        ...circuitCards.filter((card) => card.rarity === rarity),
        ...unclassifiedCircuits
    ];
    const availableRarities = supportedRarities.filter(
        (rarity) => pack.probabilities[rarity] > 0 &&
            (vehicleCards.some((card) => card.rarity === rarity) || circuitsForRarity(rarity).length > 0)
    );

    if (availableRarities.length === 0) {
        throw new Error('Aucune carte disponible dans le catalogue du booster.');
    }

    const circuitRarities = availableRarities.filter((rarity) => circuitsForRarity(rarity).length > 0);

    if (circuitRarities.length === 0) {
        throw new Error('Aucune carte circuit disponible dans le catalogue du booster.');
    }

    const drawRarityFrom = (rarities: Rarity[]) => {
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

    const results: BoosterCatalogCard[] = [];
    const guaranteedCircuitRarity = drawRarityFrom(circuitRarities);
    const guaranteedCircuitPool = circuitsForRarity(guaranteedCircuitRarity);
    const guaranteedCircuit = guaranteedCircuitPool[Math.floor(random() * guaranteedCircuitPool.length)];
    results.push({
        ...guaranteedCircuit,
        rarity: supportedRarities.includes(guaranteedCircuit.rarity as Rarity)
            ? guaranteedCircuit.rarity
            : guaranteedCircuitRarity,
        category: 'circuit'
    });

    while (results.length < count) {
        const rarity = drawRarityFrom(availableRarities);

        const vehicles = vehicleCards.filter((card) => card.rarity === rarity);
        const circuits = circuitsForRarity(rarity);
        let source = vehicles;

        if (vehicles.length > 0 && circuits.length > 0) {
            source = random() < pack.circuitDropRate ? circuits : vehicles;
        } else if (circuits.length > 0) {
            source = circuits;
        }

        const selected = source[Math.floor(random() * source.length)];
        results.push({
            ...selected,
            rarity: supportedRarities.includes(selected.rarity as Rarity) ? selected.rarity : rarity,
            category: source === circuits ? 'circuit' : 'vehicle'
        });
    }

    return results;
}
