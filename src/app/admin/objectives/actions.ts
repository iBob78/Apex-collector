'use server';

import { revalidatePath } from 'next/cache';
import { getAdminAccess } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import type {
  ObjectiveCardCategory,
  ObjectiveCategory,
  ObjectiveDefinition,
  ObjectiveRequirement,
  ObjectiveRequirementOperator,
  ObjectiveType,
} from '@/lib/actions/objectives';

export type ObjectiveRequirementDraft = Omit<ObjectiveRequirement, 'target_count'> & {
  target_count: number | '';
};

export type ObjectiveDraft = {
  category: ObjectiveCategory;
  title: string;
  description: string;
  objective_type: ObjectiveType;
  target_count: number | '';
  required_rarity: string;
  requirements: ObjectiveRequirementDraft[];
  requirement_operator: ObjectiveRequirementOperator;
  reward_ap: number | '';
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
  'collection_requirement',
];
const rarities = ['Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon'];
const cardCategories: ObjectiveCardCategory[] = ['vehicle', 'circuit', 'driver'];
const requirementTextFields = [
  'card_id', 'item_label', 'make', 'model', 'year', 'rarity',
  'country', 'type', 'fuel_type', 'transmission',
] as const;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getAdminClient() {
  const client = await createServerSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error) return { client: null, error: `Impossible de vérifier la session : ${error.message}` };
  if (!user) return { client: null, error: 'Connecte-toi pour gérer les objectifs.' };
  const adminAccess = await getAdminAccess(client);
  if (adminAccess.error) return { client: null, error: `${adminAccess.error}. Vérifie que la migration 034_managed_admin_users.sql a été appliquée.` };
  if (!adminAccess.isAdmin) return { client: null, error: 'Cette action est réservée aux administrateurs.' };
  return { client, error: null };
}

function validateDraft(draft: ObjectiveDraft) {
  if (!draft || typeof draft !== 'object') return 'Les informations de l’objectif sont invalides.';
  if (!draft || !['contract', 'achievement'].includes(draft.category)) return 'Choisis un type d’objectif valide.';
  if (typeof draft.title !== 'string' || !draft.title.trim() || draft.title.trim().length > 100) {
    return 'Le titre est obligatoire et doit contenir au plus 100 caractères.';
  }
  if (typeof draft.description !== 'string' || draft.description.trim().length > 500) {
    return 'La description doit contenir au plus 500 caractères.';
  }
  if (!objectiveTypes.includes(draft.objective_type)) return 'Choisis un objectif valide.';
  if (draft.objective_type !== 'collection_requirement' &&
    (typeof draft.target_count !== 'number' || !Number.isInteger(draft.target_count) || draft.target_count < 1 || draft.target_count > 1000000)) {
    return 'La cible doit être un entier entre 1 et 1 000 000.';
  }
  if (typeof draft.reward_ap !== 'number' || !Number.isInteger(draft.reward_ap) || draft.reward_ap < 0 || draft.reward_ap > 1000000) {
    return 'La récompense doit être un entier entre 0 et 1 000 000 AC.';
  }
  if (draft.objective_type === 'rarity_card' && !rarities.includes(draft.required_rarity)) {
    return 'Choisis une rareté pour cet objectif.';
  }
  if (!Array.isArray(draft.requirements)) return 'Les conditions de collection sont invalides.';
  if (draft.objective_type === 'collection_requirement') {
    if (draft.requirement_operator !== 'all' && draft.requirement_operator !== 'any') {
      return 'Choisis comment combiner les conditions.';
    }
    if (draft.requirements.length < 1 || draft.requirements.length > 20) {
      return 'Ajoute entre 1 et 20 conditions de collection.';
    }
    for (const requirement of draft.requirements) {
      if (!requirement || !cardCategories.includes(requirement.category)) {
        return 'Choisis une catégorie valide pour chaque condition.';
      }
      if (requirementTextFields.some((field) => typeof requirement[field] !== 'string' || requirement[field].length > 160)) {
        return 'Un filtre de carte est invalide ou trop long.';
      }
      if (requirement.card_id && !uuidPattern.test(requirement.card_id)) {
        return 'La carte sélectionnée est invalide.';
      }
      if (requirement.count_mode !== 'copies' && requirement.count_mode !== 'unique') {
        return 'Choisis un mode de comptage valide.';
      }
      if (typeof requirement.target_count !== 'number' || !Number.isInteger(requirement.target_count) || requirement.target_count < 1 || requirement.target_count > 1000000) {
        return 'La quantité de chaque condition doit être un entier entre 1 et 1 000 000.';
      }
      if (requirement.year && !/^\d{4}$/.test(requirement.year)) {
        return 'L’année d’une condition doit être valide.';
      }
      if (requirement.rarity && !rarities.includes(requirement.rarity)) {
        return 'Choisis une rareté valide pour chaque condition.';
      }
    }
  }
  if (typeof draft.is_active !== 'boolean') return 'Le statut de publication est invalide.';
  return null;
}

function toPayload(draft: ObjectiveDraft) {
  const requirements = draft.objective_type === 'collection_requirement'
    ? draft.requirements.map((requirement) => ({
        ...requirement,
        target_count: Number(requirement.target_count),
        card_id: requirement.card_id || '',
        item_label: requirement.item_label.trim(),
        make: requirement.make.trim(),
        model: requirement.model.trim(),
        year: requirement.year.trim(),
        rarity: requirement.rarity.trim(),
        country: requirement.country.trim(),
        type: requirement.type.trim(),
        fuel_type: requirement.fuel_type.trim(),
        transmission: requirement.transmission.trim(),
      }))
    : [];
  return {
    category: draft.category,
    title: draft.title.trim(),
    description: draft.description.trim(),
    objective_type: draft.objective_type,
    target_count: draft.objective_type === 'collection_requirement'
      ? draft.requirement_operator === 'any' ? 1 : requirements.length
      : Number(draft.target_count),
    required_rarity: draft.objective_type === 'rarity_card' ? draft.required_rarity : null,
    requirements,
    requirement_operator: draft.objective_type === 'collection_requirement' ? draft.requirement_operator : 'all',
    reward_ap: Number(draft.reward_ap),
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
