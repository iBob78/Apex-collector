import { supabase } from '@/lib/supabaseClient';

export type ObjectiveCategory = 'contract' | 'achievement';
export type ObjectiveType =
  | 'booster_open'
  | 'collection_count'
  | 'rarity_card'
  | 'marketplace_listing'
  | 'circuit_collection'
  | 'daily_login';

export type ObjectiveDefinition = {
  id: string;
  category: ObjectiveCategory;
  title: string;
  description: string;
  objective_type: ObjectiveType;
  target_count: number;
  required_rarity: string | null;
  reward_ap: number;
  is_active: boolean;
  created_at: string;
};

export type ObjectiveProgress = {
  id: string;
  user_id: string;
  objective_id: string;
  current_count: number;
  status: 'active' | 'completed' | 'claimed';
  started_at: string;
  completed_at: string | null;
  objective: ObjectiveDefinition;
};

export async function getUserObjectives(userId: string, category: ObjectiveCategory) {
  if (!userId) return { data: [] as ObjectiveProgress[], error: 'Non authentifié' };

  const { error: ensureError } = await supabase.rpc('ensure_user_objectives');
  if (ensureError) return { data: [] as ObjectiveProgress[], error: ensureError.message };

  const { data: objectives, error: objectivesError } = await supabase
    .from('objective_definitions')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('created_at', { ascending: true });

  if (objectivesError) return { data: [] as ObjectiveProgress[], error: objectivesError.message };
  if (!objectives?.length) return { data: [] as ObjectiveProgress[], error: null };

  const { data: progressRows, error: progressError } = await supabase
    .from('user_objective_progress')
    .select('*')
    .eq('user_id', userId)
    .in('objective_id', objectives.map((objective) => objective.id));

  if (progressError) return { data: [] as ObjectiveProgress[], error: progressError.message };

  const progressByObjective = new Map((progressRows ?? []).map((progress) => [progress.objective_id, progress]));
  const data = objectives.flatMap((objective) => {
    const progress = progressByObjective.get(objective.id);
    return progress ? [{ ...progress, objective } as ObjectiveProgress] : [];
  });

  return { data, error: null };
}

export async function updateQuestProgress(
  userId: string,
  objectiveType: ObjectiveType | 'marketplace_sell' | 'collection_target',
  amount = 1,
  metadata?: { rarity?: string },
) {
  if (!userId || !Number.isInteger(amount) || amount < 1) return;

  const normalizedType = objectiveType === 'marketplace_sell'
    ? 'marketplace_listing'
    : objectiveType === 'collection_target'
      ? 'rarity_card'
      : objectiveType;

  try {
    const { error } = await supabase.rpc('record_objective_progress', {
      p_objective_type: normalizedType,
      p_amount: amount,
      p_rarity: metadata?.rarity ?? null,
    });
    if (error) console.error('[updateQuestProgress] Impossible de mettre à jour la progression:', error.message);
  } catch (error) {
    console.error('[updateQuestProgress] Impossible de mettre à jour la progression:', error);
  }
}

export async function claimObjectiveReward(userId: string, progressId: string) {
  if (!userId || !progressId) return { success: false as const, error: 'Paramètres invalides.' };

  const { data, error } = await supabase.rpc('claim_objective_reward', {
    p_progress_id: progressId,
  });
  if (error) return { success: false as const, error: error.message };
  if (!data?.success) return { success: false as const, error: data?.error ?? 'Récompense non disponible.' };

  return { success: true as const, reward: Number(data.reward) || 0 };
}
