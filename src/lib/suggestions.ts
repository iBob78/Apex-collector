export const SUGGESTION_CATEGORIES = ['vehicle', 'circuit', 'driver'] as const;
export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number];
export type SuggestionStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

export type SuggestionDraft = {
  category: SuggestionCategory;
  details: Record<string, string>;
  submitterName: string;
  sourceUrl: string;
  message: string;
};

export type SuggestionRecord = {
  id: string;
  user_id: string;
  category: SuggestionCategory;
  title: string;
  details: Record<string, string>;
  submitter_name: string | null;
  source_url: string | null;
  message: string | null;
  status: SuggestionStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type SuggestionField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'url' | 'select';
  required?: boolean;
  options?: string[];
  hint?: string;
};

export const SUGGESTION_FIELDS: Record<SuggestionCategory, SuggestionField[]> = {
  vehicle: [
    { name: 'make', label: 'Marque', required: true },
    { name: 'model', label: 'Modèle', required: true },
    { name: 'year', label: 'Année', type: 'number', required: true },
    { name: 'power_hp', label: 'Puissance (ch)', type: 'number' },
    { name: 'power_kw', label: 'Puissance (kW)', type: 'number' },
    { name: 'torque_nm', label: 'Couple (Nm)', type: 'number' },
    { name: 'max_speed_kmh', label: 'Vitesse maximale (km/h)', type: 'number' },
    { name: 'weight_t', label: 'Masse (tonnes)', type: 'number' },
    { name: 'acceleration_0_100', label: '0 à 100 km/h (secondes)', type: 'number' },
    { name: 'engine_size', label: 'Motorisation', hint: 'Ex. : V8 4.0 L biturbo' },
    { name: 'cylinder', label: 'Architecture moteur', hint: 'Ex. : V8, flat-six' },
    { name: 'boost', label: 'Suralimentation' },
    { name: 'country_code', label: 'Code pays', hint: 'Ex. : FR, DE, JP' },
    { name: 'transmission', label: 'Transmission', hint: 'Ex. : FR, MR, AWD' },
    { name: 'new_price_eur', label: 'Prix neuf (€)', type: 'number' },
    { name: 'fuel_type', label: 'Carburant' },
    { name: 'max_rpm', label: 'Régime maximal (tr/min)', type: 'number' },
    { name: 'units_sold', label: 'Exemplaires vendus', type: 'number' },
    { name: 'image_url', label: 'Lien vers une image', type: 'url' },
  ],
  circuit: [
    { name: 'name', label: 'Nom du circuit', required: true },
    { name: 'country', label: 'Pays' },
    { name: 'country_code', label: 'Code pays', hint: 'Ex. : FR, IT, JP' },
    { name: 'year', label: 'Année à associer', type: 'number' },
    { name: 'type', label: 'Type', type: 'select', options: ['Route', 'Urbain', 'Oval'] },
    { name: 'length_km', label: 'Longueur (km)', type: 'number' },
    { name: 'turns', label: 'Nombre de virages', type: 'number' },
    { name: 'straight_km', label: 'Plus longue ligne droite (km)', type: 'number' },
    { name: 'image_url', label: 'Lien vers une image', type: 'url' },
  ],
  driver: [
    { name: 'name', label: 'Nom du pilote', required: true },
    { name: 'year', label: 'Année de la carte', type: 'number', required: true },
    { name: 'birth_date', label: 'Date de naissance', type: 'date' },
    { name: 'country', label: 'Pays', required: true },
    { name: 'country_code', label: 'Code pays', hint: 'Ex. : FR, GB, BR' },
    { name: 'world_championships', label: 'Titres mondiaux', type: 'number' },
    { name: 'won_monaco_gp', label: 'A déjà gagné le GP de Monaco', type: 'select', options: ['Non', 'Oui'] },
    { name: 'won_indy_500', label: 'A déjà gagné les 500 miles d’Indianapolis', type: 'select', options: ['Non', 'Oui'] },
    { name: 'won_24h_le_mans', label: 'A déjà gagné les 24 Heures du Mans', type: 'select', options: ['Non', 'Oui'] },
    { name: 'image_url', label: 'Lien vers une image', type: 'url' },
  ],
};

const numericFields: Record<SuggestionCategory, string[]> = {
  vehicle: [
    'year', 'power_hp', 'power_kw', 'torque_nm', 'max_speed_kmh', 'weight_t',
    'acceleration_0_100', 'new_price_eur', 'max_rpm', 'units_sold',
  ],
  circuit: ['year', 'length_km', 'turns', 'straight_km'],
  driver: ['year', 'world_championships'],
};

const integerFields: Record<SuggestionCategory, string[]> = {
  vehicle: ['year', 'max_rpm', 'units_sold'],
  circuit: ['year', 'turns'],
  driver: ['year', 'world_championships'],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseSuggestionDraft(input: unknown):
  | { data: SuggestionDraft; title: string }
  | { error: string } {
  if (!isRecord(input) || !SUGGESTION_CATEGORIES.includes(input.category as SuggestionCategory)) {
    return { error: 'Choisis une catégorie de suggestion valide.' };
  }

  const category = input.category as SuggestionCategory;
  if (
    !isRecord(input.details) ||
    typeof input.submitterName !== 'string' ||
    typeof input.sourceUrl !== 'string' ||
    typeof input.message !== 'string'
  ) {
    return { error: 'Les informations de la suggestion sont invalides.' };
  }

  const allowedFields = SUGGESTION_FIELDS[category];
  const details: Record<string, string> = {};
  for (const [key, value] of Object.entries(input.details)) {
    const field = allowedFields.find((candidate) => candidate.name === key);
    if (!field || typeof value !== 'string' || value.length > (field.type === 'url' ? 2048 : 200)) {
      return { error: 'Un ou plusieurs champs de la suggestion sont invalides.' };
    }
    const cleanValue = value.trim();
    if (field.type === 'select' && cleanValue && !field.options?.includes(cleanValue)) {
      return { error: `La valeur du champ « ${field.label} » est invalide.` };
    }
    if (field.type === 'url' && cleanValue) {
      try {
        const url = new URL(cleanValue);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Invalid protocol');
      } catch {
        return { error: `Le lien du champ « ${field.label} » doit être une URL http ou https valide.` };
      }
    }
    if (cleanValue) details[key] = cleanValue;
  }

  for (const field of allowedFields) {
    if (field.required && !details[field.name]) {
      return { error: `Le champ « ${field.label} » est obligatoire.` };
    }
  }

  for (const field of numericFields[category]) {
    const value = details[field];
    if (value === undefined) continue;
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
      return { error: 'Les champs numériques doivent contenir des nombres positifs ou nuls.' };
    }
    if (integerFields[category].includes(field) && !Number.isInteger(number)) {
      return { error: 'L’année et les compteurs doivent être des nombres entiers.' };
    }
  }

  const year = details.year ? Number(details.year) : null;
  const minimumYear = category === 'vehicle' ? 1886 : category === 'circuit' ? 1900 : 1880;
  if (year !== null && (year < minimumYear || year > new Date().getFullYear() + 2)) {
    return { error: 'Indique une année valide.' };
  }

  if (category === 'driver' && details.birth_date) {
    const birthDate = details.birth_date;
    const parsedDate = new Date(`${birthDate}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== birthDate ||
      (year !== null && birthDate > `${year}-12-31`)
    ) {
      return { error: 'La date de naissance du pilote est invalide.' };
    }
  }

  const submitterName = input.submitterName.trim();
  const sourceUrl = input.sourceUrl.trim();
  const message = input.message.trim();
  if (submitterName.length > 60 || message.length > 1000) {
    return { error: 'Le pseudo ou le commentaire dépasse la longueur autorisée.' };
  }
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Invalid protocol');
    } catch {
      return { error: 'Le lien de référence doit être une URL http ou https valide.' };
    }
  }

  const title = category === 'vehicle'
    ? `${details.make} ${details.model}`
    : details.name;

  return {
    data: { category, details, submitterName, sourceUrl, message },
    title: title.slice(0, 160),
  };
}

export function getSuggestionFieldLabel(category: SuggestionCategory, name: string) {
  return SUGGESTION_FIELDS[category].find((field) => field.name === name)?.label ?? name;
}
