import { getRarityBorderClass, getRarityColor } from '../rarity';

describe('game card rarities', () => {
  it('uses the requested colors for the main card rarities', () => {
    expect(getRarityColor('Common')).toBe('#ffffff');
    expect(getRarityBorderClass('Common')).toContain('border-white');

    expect(getRarityColor('Uncommon')).toBe('#22c55e');
    expect(getRarityBorderClass('Uncommon')).toContain('border-green-500');

    expect(getRarityColor('Atypique')).toBe('#ec4899');
    expect(getRarityBorderClass('Atypique')).toContain('border-pink-500');

    expect(getRarityColor('Rare')).toBe('#eab308');
    expect(getRarityBorderClass('Rare')).toContain('border-yellow-500');

    expect(getRarityColor('Very rare')).toBe('#f97316');
    expect(getRarityBorderClass('Very rare')).toContain('border-orange-500');

    expect(getRarityColor('Epic')).toBe('#a855f7');
    expect(getRarityBorderClass('Epic')).toContain('border-purple-500');

    expect(getRarityColor('Legend')).toBe('#fbbf24');
    expect(getRarityBorderClass('Legend')).toBe('rarity-legend-holographic');

    expect(getRarityColor('Icon')).toBe('#ff4fd8');
    expect(getRarityBorderClass('Icon')).toBe('rarity-icon-holographic');

    expect(getRarityColor('Mythic')).toBe('#c0c0c0');
    expect(getRarityBorderClass('Mythic')).toBe('rarity-mythic-holographic');
  });
});
