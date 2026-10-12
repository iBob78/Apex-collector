'use server';

import { revalidatePath } from 'next/cache';
import { isAdminEmail } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import type { ObjectiveCategory, ObjectiveDefinition, ObjectiveType } from '@/lib/actions/objectives';

export type ObjectiveDraft = {
  category: ObjectiveCategory;
  title: string;
  description: string;
  objective_type: ObjectiveType;
  target_count: number;
  required_rarity: string;
  reward_ap: number;
  is_active: boolean;
};

type SaveResult =
  | { success: true; objective: ObjectiveDefinition }
  | { success: false; error: string };

const objectiveTypes: ObjectiveType[] = [
  'booster_open',
  'collection_count',
  'rarity_card',
  'marketplace_listing',
  'circuit_collection',
  'daily_login',
];
const rarities = ['Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon'];

async function getAdminClient() {
  const client = await createServerSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error) return { client: null, error: `Impossible de vérifier la session : ${error.message}` };
  if (!user) return { client: null, error: 'Connecte-toi pour gérer les objectifs.' };
  if (!isAdminEmail(user.email)) return { client: null, error: 'Cette action est réservée aux administrateurs.' };
  return { client, error: null };
}

function validateDraft(draft: ObjectiveDraft) {
  if (!draft || !['contract', 'achievement'].includes(draft.category)) return 'Choisis un type d’objectif valide.';
  if (typeof draft.title !== 'string' || !draft.title.trim() || draft.title.trim().length > 100) {
    return 'Le titre est obligatoire et doit contenir au plus 100 caractères.';
  }
  if (typeof draft.description !== 'string' || draft.description.trim().length > 500) {
    return 'La description doit contenir au plus 500 caractères.';
  }
  if (!objectiveTypes.includes(draft.objective_type)) return 'Choisis un objectif valide.';
  if (!Number.isInteger(draft.target_count) || draft.target_count < 1 || draft.target_count > 1000000) {
    return 'La cible doit être un entier entre 1 et 1 000 000.';
  }
  if (!Number.isInteger(draft.reward_ap) || draft.reward_ap < 0 || draft.reward_ap > 1000000) {
    return 'La récompense doit être un entier entre 0 et 1 000 000 AP.';
  }
  if (draft.objective_type === 'rarity_card' && !rarities.includes(draft.required_rarity)) {
    return 'Choisis une rareté pour cet objectif.';
  }
  if (typeof draft.is_active !== 'boolean') return 'Le statut de publication est invalide.';
  return null;
}

function toPayload(draft: ObjectiveDraft) {
  return {
    category: draft.category,
    title: draft.title.trim(),
    description: draft.description.trim(),
    objective_type: draft.objective_type,
    target_count: draft.target_count,
    required_rarity: draft.objective_type === 'rarity_card' ? draft.required_rarity : null,
    reward_ap: draft.reward_ap,
    is_active: draft.is_active,
  };
}

function revalidateObjectivePages() {
  revalidatePath('/admin/objectives');
  revalidatePath('/missions');
  revalidatePath('/achievements');
}

export async function createObjective(draft: ObjectiveDraft): Promise<SaveResult> {
  const authorization = await getAdminClient();
  if (!authorization.client) return { success: false, error: authorization.error ?? 'Accès administrateur refusé.' };

  const validationError = validateDraft(draft);
  if (validationError) return { success: false, error: validationError };

  const { data, error } = await authorization.client
    .from('objective_definitions')
    .insert(toPayload(draft))
    .select('*')
    .single();
  if (error) return { success: false, error: `L’objectif n’a pas pu être créé : ${error.message}` };

  revalidateObjectivePages();
  return { success: true, objective: data as ObjectiveDefinition };
}

export async function updateObjective(id: string, draft: ObjectiveDraft): Promise<SaveResult> {
  if (typeof id !== 'string' || !id.trim()) return { success: false, error: 'Identifiant d’objectif manquant.' };
  const authorization = await getAdminClient();
  if (!authorization.client) return { success: false, error: authorization.error ?? 'Accès administrateur refusé.' };

  const validationError = validateDraft(draft);
  if (validationError) return { success: false, error: validationError };

  const { data, error } = await authorization.client
    .from('objective_definitions')
    .update({ ...toPayload(draft), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) return { success: false, error: `L’objectif n’a pas pu être modifié : ${error.message}` };

  revalidateObjectivePages();
  return { success: true, objective: data as ObjectiveDefinition };
}

export async function setObjectiveActive(id: string, isActive: boolean) {
  if (typeof id !== 'string' || !id.trim() || typeof isActive !== 'boolean') {
    return { success: false as const, error: 'Paramètres invalides.' };
  }
  const authorization = await getAdminClient();
  if (!authorization.client) return { success: false as const, error: authorization.error ?? 'Accès administrateur refusé.' };

  const { error } = await authorization.client
    .from('objective_definitions')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { success: false as const, error: `Le statut n’a pas pu être modifié : ${error.message}` };

  revalidateObjectivePages();
  return { success: true as const };
}
