/**
 * Cherche le plus petit numéro absent dans une liste triée par ordre croissant.
 * La recherche peut se poursuivre d'une page Supabase à l'autre via nextExpected.
 * Sans trou, l'attribution normale reste assurée par la séquence PostgreSQL.
 */
export function findCollectionNumberGap(
  sortedNumbers: readonly number[],
  nextExpected = 1,
): { missing: number | null; nextExpected: number } {
  let candidate = nextExpected;

  for (const number of sortedNumbers) {
    if (!Number.isSafeInteger(number) || number < 1) continue;
    if (number > candidate) return { missing: candidate, nextExpected: candidate };
    if (number === candidate) candidate += 1;
  }

  return { missing: null, nextExpected: candidate };
}
