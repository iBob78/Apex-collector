'use server';

import { revalidatePath } from 'next/cache';
import { getAdminAccess } from '@/lib/admin';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export type DriverDraft = {
  name: string;
  year: string;
  birth_date: string;
  country: string;
  country_code: string;
  world_championships: string;
  won_monaco_gp: boolean;
  won_indy_500: boolean;
  won_24h_le_mans: boolean;
  rarity: string;
  image_url: string;
  description: string;
  is_active: boolean;
  booster_enabled: boolean;
};

export type DriverData = {
  id: string;
  driver_id: string;
  collection_number: number;
  name: string;
  year: number;
  birth_date: string;
  country: string;
  country_code: string | null;
  world_championships: number;
  won_monaco_gp: boolean;
  won_indy_500: boolean;
  won_24h_le_mans: boolean;
  rarity: string;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
  booster_enabled: boolean;
  created_at: string;
};

type SaveResult = { success: true; driver: DriverData } | { success: false; error: string };

const rarities = ['Common', 'Uncommon', 'Atypique', 'Rare', 'Very rare', 'Epic', 'Legend', 'Mythic', 'Icon'];
const fields: (keyof DriverDraft)[] = [
  'name', 'year', 'birth_date', 'country', 'country_code', 'world_championships',
  'rarity', 'image_url', 'description',
];

async function getAdminClient(): Promise<
  | { client: Awaited<ReturnType<typeof createServerSupabaseClient>>; error: null }
  | { client: null; error: string }
> {
  const client = await createServerSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();

  if (error) return { client: null, error: `Impossible de vérifier la session : ${error.message}` };
  if (!user) return { client: null, error: 'Connecte-toi pour gérer les pilotes.' };
  const adminAccess = await getAdminAccess(client);
  if (adminAccess.error) return { client: null, error: `${adminAccess.error}. Vérifie que la migration 034_managed_admin_users.sql a été appliquée.` };
  if (!adminAccess.isAdmin) return { client: null, error: 'Cette action est réservée aux administrateurs.' };

  return { client, error: null };
}

function parseDriverDraft(draft: DriverDraft) {
  if (
    !draft ||
    typeof draft !== 'object' ||
    fields.some((field) => typeof draft[field] !== 'string') ||
    ['won_monaco_gp', 'won_indy_500', 'won_24h_le_mans', 'is_active', 'booster_enabled']
      .some((field) => typeof draft[field as keyof DriverDraft] !== 'boolean')
  ) {
    return { error: 'Les informations fournies pour le pilote sont invalides.' } as const;
  }

  const name = draft.name.trim();
  const country = draft.country.trim();
  const year = Number(draft.year);
  const birthDate = draft.birth_date.trim();
  const championships = draft.world_championships.trim() ? Number(draft.world_championships) : 0;
  const maximumYear = new Date().getFullYear() + 2;

  if (!name) return { error: 'Le nom du pilote est obligatoire.' } as const;
  if (!country) return { error: 'Le pays d’origine est obligatoire.' } as const;
  if (!Number.isInteger(year) || year < 1880 || year > maximumYear) {
    return { error: 'Indique une année de carte valide.' } as const;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(Date.parse(`${birthDate}T00:00:00Z`))) {
    return { error: 'Indique une date de naissance valide.' } as const;
  }
  const parsedBirthDate = new Date(`${birthDate}T00:00:00Z`);
  if (parsedBirthDate.toISOString().slice(0, 10) !== birthDate || birthDate > `${year}-12-31`) {
    return { error: 'La date de naissance doit précéder la fin de l’année de la carte.' } as const;
  }
  if (!Number.isInteger(championships) || championships < 0) {
    return { error: 'Le nombre de titres mondiaux doit être un entier positif ou nul.' } as const;
  }
  if (!rarities.includes(draft.rarity)) {
    return { error: 'Choisis une rareté valide.' } as const;
  }

  return {
    data: {
      name,
      year,
      birth_date: birthDate,
      country,
      country_code: draft.country_code.trim() || null,
      world_championships: championships,
      won_monaco_gp: draft.won_monaco_gp,
      won_indy_500: draft.won_indy_500,
      won_24h_le_mans: draft.won_24h_le_mans,
      rarity: draft.rarity,
      image_url: draft.image_url.trim() || null,
      description: draft.description.trim() || null,
      is_active: draft.is_active,
      booster_enabled: draft.booster_enabled,
    },
  } as const;
}

function revalidateDriverPages() {
  revalidatePath('/admin/drivers');
  revalidatePath('/collection');
  revalidatePath('/open');
  revalidatePath('/profile');
}

export async function createDriver(draft: DriverDraft): Promise<SaveResult> {
  const authorization = await getAdminClient();
  if (!authorization.client) return { success: false, error: authorization.error };

  const parsed = parseDriverDraft(draft);
  if (!('data' in parsed)) return { success: false, error: parsed.error };

  const { data, error } = await authorization.client
    .from('drivers')
    .insert({ ...parsed.data, driver_id: crypto.randomUUID() })
    .select('*')
    .single();

  if (error) return { success: false, error: `Le pilote n’a pas pu être créé : ${error.message}` };
  revalidateDriverPages();
  return { success: true, driver: data as DriverData };
}

export async function updateDriver(id: string, draft: DriverDraft): Promise<SaveResult> {
  if (typeof id !== 'string' || !id.trim()) return { success: false, error: 'Identifiant de pilote manquant.' };

  const authorization = await getAdminClient();
  if (!authorization.client) return { success: false, error: authorization.error };

  const parsed = parseDriverDraft(draft);
  if (!('data' in parsed)) return { success: false, error: parsed.error };

  const { data, error } = await authorization.client
    .from('drivers')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return { success: false, error: `Le pilote n’a pas pu être modifié : ${error.message}` };
  revalidateDriverPages();
  return { success: true, driver: data as DriverData };
}
