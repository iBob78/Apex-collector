export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Epic' | 'Legendary' | 'Prototype' | 'Unique' | 'Mythic';

export const RARITY_CONFIG: Record<Rarity, { color: string; material: string }> = {
    'Common': { color: '#22c55e', material: 'bg-green-500' }, // Vert
    'Uncommon': { color: '#3b82f6', material: 'bg-blue-500' }, // Bleu
    'Rare': { color: '#ef4444', material: 'bg-[url("/textures/carbon.png")]' }, // Rouge / Carbone
    'Ultra Rare': { color: '#a855f7', material: 'bg-[url("/textures/kevlar.png")]' }, // Violet / Kevlar
    'Epic': { color: '#f59e0b', material: 'bg-[url("/textures/kevlar-carbon.png")]' }, // Or / Kevlar Carbone
    'Legendary': { color: '#94a3b8', material: 'bg-[url("/textures/titanium.png")]' }, // Gris / Titane
    'Prototype': { color: '#06b6d4', material: 'bg-cyan-500' }, // Cyan
    'Unique': { color: '#ec4899', material: 'bg-pink-500' }, // Rose
    'Mythic': { color: '#000000', material: 'bg-[url("/textures/forged-carbon.png")]' }, // Noir / Carbone Forgé
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
        case 'Common': return 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
        case 'Uncommon': return 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]';
        case 'Rare': return 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
        case 'Ultra Rare': return 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]';
        case 'Epic': return 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]';
        case 'Legendary': return 'border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.4)]';
        case 'Prototype': return 'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]';
        case 'Unique': return 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]';
        case 'Mythic': return 'border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]';
        default: return 'border-green-500';
    }
}
