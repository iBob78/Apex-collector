export function getDriverAgeAtCardYear(birthDate: string | null | undefined, cardYear: number | string | null | undefined): number | null {
  if (!birthDate || cardYear === null || cardYear === undefined || cardYear === '') return null;

  const birthYear = Number(birthDate.slice(0, 4));
  const year = Number(cardYear);
  if (!Number.isInteger(birthYear) || !Number.isInteger(year) || year < birthYear) return null;

  return year - birthYear;
}
