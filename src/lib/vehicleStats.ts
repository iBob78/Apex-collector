export function calculateVehicleIP(powerHp: number | string | null | undefined, weight: number | string | null | undefined) {
  const power = Number(powerHp) || 0;
  const rawWeight = Number(weight) || 0;
  const weightKg = rawWeight > 50 ? rawWeight : rawWeight * 1000;

  return power > 0 && weightKg > 0 ? Math.floor((power / weightKg) * 1000) : 0;
}
