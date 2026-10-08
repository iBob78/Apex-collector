import { getRarityBorderClass, getRarityColor } from '../rarity';

describe('game card rarities', () => {
  it('assigns dedicated visuals to Legend and Icon cards', () => {
    expect(getRarityColor('Legend')).toBe('#fbbf24');
    expect(getRarityBorderClass('Legend')).toContain('border-yellow-400');
    expect(getRarityColor('Icon')).toBe('#ef4444');
    expect(getRarityBorderClass('Icon')).toContain('border-red-500');
  });
});
