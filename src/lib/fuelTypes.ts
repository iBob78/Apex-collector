export const fuelTypes = [
  { code: 'ES', label: 'Essence' },
  { code: 'GO', label: 'Gazole (Diesel)' },
  { code: 'EL', label: 'Électricité (100 % électrique)' },
  { code: 'EE', label: 'Essence-électricité (hybride rechargeable)' },
  { code: 'EH', label: 'Essence-électricité (hybride non rechargeable)' },
  { code: 'GL', label: 'Gazole-électricité (hybride rechargeable)' },
  { code: 'GH', label: 'Gazole-électricité (hybride non rechargeable)' },
  { code: 'E85', label: 'Superéthanol (E85)' },
  { code: 'ET', label: 'Éthanol' },
  { code: 'GP', label: 'Gaz de pétrole liquéfié (GPL)' },
  { code: 'GN', label: 'Gaz naturel pour véhicules (GNV / GNC)' },
  { code: 'H2', label: 'Hydrogène' },
  { code: 'EG', label: 'Bicarburation essence-GPL' },
  { code: 'EN', label: 'Bicarburation essence-gaz naturel' },
  { code: 'FG', label: 'Bicarburation superéthanol-GPL' },
  { code: 'FL', label: 'Bicarburation superéthanol-électricité (hybride rechargeable)' },
] as const;

const legacyFuelAliases = new Map([
  ['essence', 'ES'],
  ['gazole', 'GO'],
  ['diesel', 'GO'],
  ['electricite', 'EL'],
  ['electrique', 'EL'],
  ['superethanol', 'E85'],
  ['ethanol', 'ET'],
  ['gpl', 'GP'],
  ['gnv', 'GN'],
  ['gnc', 'GN'],
  ['hydrogene', 'H2'],
]);

function normalizeFuelValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('fr');
}

export function getFuelTypeInfo(value: string | null | undefined) {
  if (!value) return null;

  const normalized = value.trim().toUpperCase();
  const exactMatch = fuelTypes.find((fuel) => fuel.code === normalized);
  if (exactMatch) return exactMatch;

  const normalizedValue = normalizeFuelValue(value);
  const labelMatch = fuelTypes.find((fuel) => normalizeFuelValue(fuel.label) === normalizedValue);
  if (labelMatch) return labelMatch;

  const aliasCode = legacyFuelAliases.get(normalizedValue);
  return aliasCode ? fuelTypes.find((fuel) => fuel.code === aliasCode) ?? null : null;
}
