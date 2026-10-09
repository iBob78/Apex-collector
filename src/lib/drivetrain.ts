export const drivetrainLayouts = ['MR', 'FF', 'FR', 'MF', 'FA', 'RR', 'RA', 'MA'] as const;

export type DrivetrainLayout = (typeof drivetrainLayouts)[number];

export const drivetrainLayoutDescriptions: Record<DrivetrainLayout, string> = {
  MR: 'Moteur central arrière, propulsion',
  FF: 'Moteur central avant, traction',
  FR: 'Moteur central avant, propulsion',
  MF: 'Moteur central, traction',
  FA: 'Moteur central avant, quatre roues motrices',
  RR: 'Moteur arrière, propulsion',
  RA: 'Moteur arrière, quatre roues motrices',
  MA: 'Moteur central, quatre roues motrices',
};
