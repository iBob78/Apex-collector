export type Rarity = 'Common' | 'Uncommon' | 'Atypique' | 'Rare' | 'Very rare' | 'Ultra Rare' | 'Epic' | 'Legend' | 'Legendary' | 'Icon' | 'Prototype' | 'Unique' | 'Mythic';

export const RARITY_CONFIG: Record<Rarity, { color: string; material: string }> = {
    'Common': { color: '#ffffff', material: 'bg-white' },
    'Uncommon': { color: '#22c55e', material: 'bg-green-500' },
    'Atypique': { color: '#ec4899', material: 'bg-pink-500' },
    'Rare': { color: '#eab308', material: 'bg-yellow-500' },
    'Very rare': { color: '#f97316', material: 'bg-orange-500' },
    'Ultra Rare': { color: '#a855f7', material: 'bg-[url("/textures/kevlar.png")]' }, // Violet / Kevlar
    'Epic': { color: '#a855f7', material: 'bg-[url("/textures/kevlar-carbon.png")]' },
    'Legend': { color: '#fbbf24', material: 'bg-[url("/textures/titanium.png")]' },
    'Legendary': { color: '#94a3b8', material: 'bg-[url("/textures/titanium.png")]' }, // Gris / Titane
    'Icon': { color: '#ff4fd8', material: 'bg-pink-500' },
    'Prototype': { color: '#06b6d4', material: 'bg-cyan-500' }, // Cyan
    'Unique': { color: '#ec4899', material: 'bg-pink-500' }, // Rose
    'Mythic': { color: '#c0c0c0', material: 'bg-slate-300' },
};

export function getRarityColor(rarity: string): string {
    // Normalize key to Title Case to match keys
    const normalizedKey = Object.keys(RARITY_CONFIG).find(
        key => key.toLowerCase() === rarity?.toLowerCase()
    ) as Rarity | undefined;

    return normalizedKey ? RARITY_CONFIG[normalizedKey].color : RARITY_CONFIG['Common'].color;
}

export function getRarityBorderClass(rarity: string): string {
    const normalizedKey = Object.keys(RARITY_CONFIG).find(
        key => key.toLowerCase() === rarity?.toLowerCase()
    ) as Rarity | undefined;

    switch (normalizedKey) {
        case 'Common': return 'border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]';
        case 'Uncommon': return 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
        case 'Atypique': return 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]';
        case 'Rare': return 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
        case 'Very rare': return 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]';
        case 'Ultra Rare': return 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]';
        case 'Epic': return 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]';
        case 'Legend': return 'rarity-legend-holographic';
        case 'Legendary': return 'border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.4)]';
        case 'Icon': return 'rarity-icon-holographic';
        case 'Prototype': return 'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]';
        case 'Unique': return 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]';
        case 'Mythic': return 'rarity-mythic-holographic';
        default: return 'border-white';
    }
}
