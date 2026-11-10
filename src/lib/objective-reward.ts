import { PACKS } from '@/lib/boosters';
import type { ObjectiveDefinition } from '@/lib/actions/objectives';

/** En mode OU, l'attribution est aleatoire (50 % AC, 50 % booster). */
export function describeObjectiveReward(
  objective: Pick<ObjectiveDefinition, 'reward_ap' | 'reward_mode' | 'reward_booster_slug'>,
): string {
  const ac = `${objective.reward_ap} AC`;
  const booster = objective.reward_booster_slug === 'random'
    ? 'Booster aléatoire'
    : PACKS[objective.reward_booster_slug]?.name ?? 'Booster';
  switch (objective.reward_mode) {
    case 'booster': return booster;
    case 'both': return `${ac} + ${booster}`;
    case 'either': return `${ac} OU ${booster}`;
    default: return ac;
  }
}

