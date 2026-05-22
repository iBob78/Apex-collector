export function convertSpeed(valueKmh: number, toImperial: boolean): string {
  return toImperial
    ? `${(valueKmh * 0.621371).toFixed(1)} mph`
    : `${valueKmh.toFixed(1)} km/h`;
}

export function convertWeight(valueKg: number, toImperial: boolean): string {
  return toImperial
    ? `${(valueKg * 2.20462).toFixed(1)} lbs`
    : `${valueKg.toFixed(1)} kg`;
}

export function convertLength(valueMeters: number, toImperial: boolean): string {
  return toImperial
    ? `${(valueMeters * 3.28084).toFixed(1)} ft`
    : `${valueMeters.toFixed(1)} m`;
}
