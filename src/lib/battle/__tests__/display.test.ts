import { battleCardStats, formatBattleStat } from '../display';
import { normalizeBattleVehicle } from '../engine';

describe('Apex Battle — affichage conforme aux cartes de la collection', () => {
  const source = {
    card_id: 'ferrari-f50-gt',
    power_hp: '740',
    torque_nm: '529',
    max_speed_kmh: '376',
    acceleration_0_100: '2.9',
    weight_t: '907',
  };

  it('convertit les HP du moteur en CV comme le composant de la collection', () => {
    const snapshot = normalizeBattleVehicle(source);
    expect(snapshot.stats.power_hp).toBe(740);
    expect(formatBattleStat('power_hp', snapshot.stats.power_hp, 'metric', 'fr')).toBe('750 CV');
    expect(formatBattleStat('power_hp', snapshot.stats.power_hp, 'imperial', 'en')).toBe('740 HP');
  });

  it('respecte aussi power_kw lorsque la collection fournit cette précision', () => {
    const snapshot = normalizeBattleVehicle(source);
    const preciseKw = 550; // 550 kW -> 748 CV selon le convertisseur de la collection
    expect(formatBattleStat('power_hp', snapshot.stats.power_hp, 'metric', 'fr', preciseKw)).toBe('748 CV');
    expect(formatBattleStat('power_hp', snapshot.stats.power_hp, 'imperial', 'en', preciseKw)).toBe('740 HP');
    // L'affichage peut être alimenté par des kW ; la manche garde l'HP de référence.
    expect(snapshot.stats.power_hp).toBe(740);
  });

  it('affiche la même masse, le même couple et le même IP que le snapshot', () => {
    const snapshot = normalizeBattleVehicle(source);
    const card = battleCardStats(snapshot);
    expect(card.power_hp).toBe(snapshot.stats.power_hp);
    expect(card.torque_nm).toBe(snapshot.stats.torque_nm);
    expect(card.weight_t).toBe(snapshot.stats.weight_kg);
    expect(card.acceleration_0_100).toBe(snapshot.stats.acceleration_0_100);
    expect(formatBattleStat('weight_kg', snapshot.stats.weight_kg, 'metric', 'fr')).toBe('907 kg');
    expect(formatBattleStat('torque_nm', snapshot.stats.torque_nm, 'metric', 'fr')).toBe('529 Nm');
    expect(formatBattleStat('ip', snapshot.stats.ip, 'metric', 'fr')).toBe('815 IP');
  });

  it('partage les unités de la collection pour les autres caractéristiques', () => {
    const snapshot = normalizeBattleVehicle(source);
    expect(formatBattleStat('max_speed_kmh', snapshot.stats.max_speed_kmh, 'metric', 'fr')).toBe('376 km/h');
    expect(formatBattleStat('acceleration_0_100', snapshot.stats.acceleration_0_100, 'metric', 'fr')).toBe('2,9 s');
  });
});
