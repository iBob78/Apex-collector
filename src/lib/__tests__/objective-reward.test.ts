import { describeObjectiveReward } from '@/lib/objective-reward';
import type { ObjectiveRewardMode } from '@/lib/actions/objectives';

describe('objective reward labels', () => {
  const format = (reward_mode: ObjectiveRewardMode, reward_booster_slug = 'random') =>
    describeObjectiveReward({ reward_ap: 1500, reward_mode, reward_booster_slug });

  it('keeps legacy AC rewards', () => {
    expect(format('ac')).toBe('1500 AC');
  });
  it('shows the selected booster', () => {
    expect(format('booster', 'carbon')).toBe('Pack Carbon');
  });
  it('shows both prizes on ET', () => {
    expect(format('both', 'rare')).toBe('1500 AC + Pack Rare');
  });
  it('shows the alternative prizes on OU', () => {
    expect(format('either')).toBe('1500 AC OU Booster aléatoire');
  });
});
