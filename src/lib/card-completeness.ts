type VehicleCompletenessRecord = {
  make?: unknown;
  model?: unknown;
  year?: unknown;
  rarity?: unknown;
  image_url?: unknown;
  power_hp?: unknown;
  torque_nm?: unknown;
  max_speed_kmh?: unknown;
  weight_t?: unknown;
};

const completenessFields: Array<[keyof VehicleCompletenessRecord, string]> = [
  ['make', 'marque'],
  ['model', 'modèle'],
  ['year', 'année'],
  ['rarity', 'rareté'],
  ['image_url', 'source explicite de l’image'],
  ['power_hp', 'puissance'],
  ['torque_nm', 'couple'],
  ['max_speed_kmh', 'vitesse maximale'],
  ['weight_t', 'poids'],
];

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (typeof value === 'number') return !Number.isFinite(value) || value <= 0;
  return false;
}

export function getIncompleteVehicleCardFields(card: VehicleCompletenessRecord): string[] {
  return completenessFields
    .filter(([field]) => isMissing(card[field]))
    .map(([, label]) => label);
}
