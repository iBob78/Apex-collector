'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { isAdminEmail } from '@/lib/admin';

const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legend', 'Icon'] as const;
const draftFields: (keyof CardDraft)[] = [
  'make', 'model', 'year', 'rarity', 'image_url', 'description',
  'power_hp', 'power_kw', 'torque_nm', 'max_speed_kmh', 'weight_t',
  'acceleration_0_100', 'engine_size', 'cylinder', 'boost', 'country_code',
  'transmission', 'new_price_eur', 'fuel_type', 'max_rpm', 'units_sold',
];

export type CardDraft = {
  make: string;
  model: string;
  year: string;
  rarity: string;
  image_url: string;
  description: string;
  power_hp: string;
  power_kw: string;
  torque_nm: string;
  max_speed_kmh: string;
  weight_t: string;
  acceleration_0_100: string;
  engine_size: string;
  cylinder: string;
  boost: string;
  country_code: string;
  transmission: string;
  new_price_eur: string;
  fuel_type: string;
  max_rpm: string;
  units_sold: string;
};

export type CardData = {
  id: string;
  card_id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  rarity: string;
  image_url: string | null;
  description: string | null;
  power_hp: number | null;
  power_kw: number | null;
  torque_nm: number | null;
  max_speed_kmh: number | null;
  weight_t: number | null;
  acceleration_0_100: number | null;
  engine_size: string | null;
  cylinder: string | null;
  boost: string | null;
  country_code: string | null;
  transmission: string | null;
  new_price_eur: number | null;
  fuel_type: string | null;
  max_rpm: number | null;
  units_sold: number | null;
};

export type CircuitDraft = {
  name: string;
  country: string;
  country_code: string;
  year: string;
  rarity: string;
  type: string;
  length_km: string;
  turns: string;
  straight_km: string;
  image_url: string;
};

export type CircuitData = {
  id: string;
  circuit_id: string;
  name: string;
  country: string | null;
  country_code: string | null;
  year: number | null;
  rarity: string;
  type: string | null;
  length_km: number | null;
  turns: number | null;
  straight_km: number | null;
  image_url: string | null;
};

type SaveResult = { success: true; card: CardData } | { success: false; error: string };
type CircuitSaveResult = { success: true; circuit: CircuitData } | { success: false; error: string };

function parseOptionalNumber(value: string, label: string) {
  if (!value.trim()) return { value: null, error: null };
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { value: null, error: `${label} doit être un nombre positif ou nul.` };
  }
  return { value: parsed, error: null };
}

function parseCardDraft(draft: CardDraft) {
  if (!draft || typeof draft !== 'object' || draftFields.some((field) => typeof draft[field] !== 'string')) {
    return { error: 'Les informations fournies pour la carte sont invalides.' } as const;
  }

  const make = draft.make.trim();
  const model = draft.model.trim();
  const year = Number(draft.year);

  if (!make || !model) {
    return { error: 'La marque et le modèle sont obligatoires.' } as const;
  }
  if (!Number.isInteger(year) || year < 1886 || year > new Date().getFullYear() + 2) {
    return { error: 'Indique une année de véhicule valide.' } as const;
  }
  if (!rarities.includes(draft.rarity as (typeof rarities)[number])) {
    return { error: 'Choisis une rareté valide.' } as const;
  }

  const numbers = {
    power_hp: parseOptionalNumber(draft.power_hp, 'La puissance'),
    power_kw: parseOptionalNumber(draft.power_kw, 'La puissance en kW'),
    torque_nm: parseOptionalNumber(draft.torque_nm, 'Le couple'),
    max_speed_kmh: parseOptionalNumber(draft.max_speed_kmh, 'La vitesse maximale'),
    weight_t: parseOptionalNumber(draft.weight_t, 'Le poids'),
    acceleration_0_100: parseOptionalNumber(draft.acceleration_0_100, 'L’accélération'),
    new_price_eur: parseOptionalNumber(draft.new_price_eur, 'Le prix neuf'),
    max_rpm: parseOptionalNumber(draft.max_rpm, 'Le régime maximal'),
    units_sold: parseOptionalNumber(draft.units_sold, 'Le nombre d’exemplaires vendus'),
  };
  const invalidNumber = Object.values(numbers).find(({ error }) => error);
  if (invalidNumber?.error) return { error: invalidNumber.error } as const;
  if (numbers.max_rpm.value !== null && !Number.isInteger(numbers.max_rpm.value)) {
    return { error: 'Le régime maximal doit être un nombre entier.' } as const;
  }
  if (numbers.units_sold.value !== null && !Number.isInteger(numbers.units_sold.value)) {
    return { error: 'Le nombre d’exemplaires vendus doit être un nombre entier.' } as const;
  }

  return {
    data: {
      name: `${make} ${model}`,
      make,
      model,
      year,
      rarity: draft.rarity,
      image_url: draft.image_url.trim() || null,
      description: draft.description.trim() || null,
      power_hp: numbers.power_hp.value,
      power_kw: numbers.power_kw.value,
      torque_nm: numbers.torque_nm.value,
      max_speed_kmh: numbers.max_speed_kmh.value,
      weight_t: numbers.weight_t.value,
      acceleration_0_100: numbers.acceleration_0_100.value,
      engine_size: draft.engine_size.trim() || null,
      cylinder: draft.cylinder.trim() || null,
      boost: draft.boost.trim() || null,
      country_code: draft.country_code.trim() || null,
      transmission: draft.transmission.trim() || null,
      new_price_eur: numbers.new_price_eur.value,
      fuel_type: draft.fuel_type.trim() || null,
      max_rpm: numbers.max_rpm.value,
      units_sold: numbers.units_sold.value,
    },
  } as const;
}

function parseCircuitDraft(draft: CircuitDraft) {
  const fields: (keyof CircuitDraft)[] = [
    'name', 'country', 'country_code', 'year', 'rarity', 'type',
    'length_km', 'turns', 'straight_km', 'image_url',
  ];
  if (!draft || typeof draft !== 'object' || fields.some((field) => typeof draft[field] !== 'string')) {
    return { error: 'Les informations fournies pour le circuit sont invalides.' } as const;
  }

  const name = draft.name.trim();
  if (!name) return { error: 'Le nom du circuit est obligatoire.' } as const;
  if (!rarities.includes(draft.rarity as (typeof rarities)[number])) {
    return { error: 'Choisis une rareté valide.' } as const;
  }
  if (draft.type && !['Route', 'Urbain', 'Oval'].includes(draft.type)) {
    return { error: 'Choisis un type de circuit valide.' } as const;
  }

  const year = parseOptionalNumber(draft.year, 'L’année');
  const length = parseOptionalNumber(draft.length_km, 'La longueur');
  const turns = parseOptionalNumber(draft.turns, 'Le nombre de virages');
  const straight = parseOptionalNumber(draft.straight_km, 'La ligne droite');
  const invalidNumber = [year, length, turns, straight].find(({ error }) => error);
  if (invalidNumber?.error) return { error: invalidNumber.error } as const;
  if (year.value !== null && (!Number.isInteger(year.value) || year.value < 1900 || year.value > new Date().getFullYear() + 2)) {
    return { error: 'Indique une année de circuit valide.' } as const;
  }
  if (turns.value !== null && !Number.isInteger(turns.value)) {
    return { error: 'Le nombre de virages doit être un entier.' } as const;
  }

  return {
    data: {
      name,
      country: draft.country.trim() || null,
      country_code: draft.country_code.trim() || null,
      year: year.value,
      rarity: draft.rarity,
      type: draft.type || null,
      length_km: length.value,
      turns: turns.value,
      straight_km: straight.value,
      image_url: draft.image_url.trim() || null,
    },
  } as const;
}

async function getAdminClient(): Promise<
  | { client: Awaited<ReturnType<typeof createServerSupabaseClient>>; error: null }
  | { client: null; error: string }
> {
  const client = await createServerSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();

  if (error) return { client: null, error: `Impossible de vérifier la session : ${error.message}` };
  if (!user) return { client: null, error: 'Connecte-toi pour gérer les cartes.' };
  if (!isAdminEmail(user.email)) return { client: null, error: 'Cette action est réservée aux administrateurs.' };

  return { client, error: null };
}

function revalidateCardPages() {
  revalidatePath('/admin/cards');
  revalidatePath('/cards');
  revalidatePath('/collection');
  revalidatePath('/collection/[id]', 'page');
}

export async function createCard(draft: CardDraft): Promise<SaveResult> {
  const authorization = await getAdminClient();
  if (!authorization.client) return { success: false, error: authorization.error ?? 'Accès administrateur refusé.' };

  const parsed = parseCardDraft(draft);
  if (!('data' in parsed)) return { success: false, error: parsed.error };

  const { data, error } = await authorization.client
    .from('cards')
    .insert({ ...parsed.data, card_id: crypto.randomUUID() })
    .select('*')
    .single();

  if (error) return { success: false, error: `La carte n’a pas pu être créée : ${error.message}` };
  revalidateCardPages();
  return { success: true, card: data as CardData };
}

export async function updateCard(id: string, draft: CardDraft): Promise<SaveResult> {
  if (typeof id !== 'string' || !id.trim()) return { success: false, error: 'Identifiant de carte manquant.' };

  const authorization = await getAdminClient();
  if (!authorization.client) return { success: false, error: authorization.error ?? 'Accès administrateur refusé.' };

  const parsed = parseCardDraft(draft);
  if (!('data' in parsed)) return { success: false, error: parsed.error };

  const { data, error } = await authorization.client
    .from('cards')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return { success: false, error: `La carte n’a pas pu être modifiée : ${error.message}` };
  revalidateCardPages();
  return { success: true, card: data as CardData };
}

export async function createCircuit(draft: CircuitDraft): Promise<CircuitSaveResult> {
  const authorization = await getAdminClient();
  if (!authorization.client) return { success: false, error: authorization.error ?? 'Accès administrateur refusé.' };

  const parsed = parseCircuitDraft(draft);
  if (!('data' in parsed)) return { success: false, error: parsed.error };

  const { data, error } = await authorization.client
    .from('circuits')
    .insert({ ...parsed.data, circuit_id: crypto.randomUUID() })
    .select('*')
    .single();

  if (error) return { success: false, error: `Le circuit n’a pas pu être créé : ${error.message}` };
  revalidatePath('/admin/circuits');
  revalidatePath('/collection');
  revalidatePath('/open');
  return { success: true, circuit: data as CircuitData };
}

export async function updateCircuit(id: string, draft: CircuitDraft): Promise<CircuitSaveResult> {
  if (typeof id !== 'string' || !id.trim()) {
    return { success: false, error: 'Identifiant de circuit manquant.' };
  }

  const authorization = await getAdminClient();
  if (!authorization.client) return { success: false, error: authorization.error ?? 'Accès administrateur refusé.' };

  const parsed = parseCircuitDraft(draft);
  if (!('data' in parsed)) return { success: false, error: parsed.error };

  const { data, error } = await authorization.client
    .from('circuits')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return { success: false, error: `Le circuit n’a pas pu être modifié : ${error.message}` };
  revalidatePath('/admin/circuits');
  revalidatePath('/collection');
  revalidatePath('/open');
  return { success: true, circuit: data as CircuitData };
}
