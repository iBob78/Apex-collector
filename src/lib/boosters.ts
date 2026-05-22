import { AnyCard, Rarity } from '@/types/game';

export interface PackConfig {
    slug: string;
    name: string;
    price: number;
    cardCount: number;
    description: string;
    color: string;
    imageUrl: string;
    probabilities: Record<Rarity, number>;
}

export const PACKS: Record<string, PackConfig> = {
    common: {
        slug: 'common',
        name: 'Pack Classique',
        description: 'Le point d\'entrée idéal. Contient principalement des cartes Standard.',
        price: 250,
        cardCount: 6,
        color: 'from-blue-600 to-blue-800',
        imageUrl: 'boosters/common.jpg',
        probabilities: {
            'Common': 0.60,
            'Uncommon': 0.25,
            'Rare': 0.10,
            'Epic': 0.04,
            'Legend': 0.01,
            'Icon': 0,
        }
    },
    rare: {
        slug: 'rare',
        name: 'Pack Épique',
        description: 'Pour les collectionneurs sérieux. Taux de cartes Épiques doublé.',
        price: 750,
        cardCount: 6,
        color: 'from-purple-600 to-purple-900',
        imageUrl: 'boosters/rare.jpg',
        probabilities: {
            'Common': 0.20,
            'Uncommon': 0.30,
            'Rare': 0.30,
            'Epic': 0.15,
            'Legend': 0.05,
            'Icon': 0,
        }
    },
    legend: {
        slug: 'legend',
        name: 'Pack Légendaire',
        description: 'Le luxe absolu. Garanti au moins une carte Rare ou supérieure.',
        price: 2500,
        cardCount: 6,
        color: 'from-yellow-400 to-orange-600',
        imageUrl: 'boosters/legend.jpg',
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
        color: 'from-gray-700 to-black',
        imageUrl: 'boosters/carbon.jpg',
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
