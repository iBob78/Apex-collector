import {
  formatPower,
  formatSpeed,
  formatTorque,
  formatWeight,
  type SiteLanguage,
  type UnitSystem,
} from '../preferences';
import type { BattleStat, BattleVehicleSnapshot } from './engine';

/**
 * Reuse the collection's unit conversions, so a battle card and its comparison
 * always show the same number. Comparison itself continues to use raw HP.
 */
export function formatBattleStat(
  stat: BattleStat,
  value: number,
  units: UnitSystem,
  language: SiteLanguage,
): string {
  switch (stat) {
    case 'power_hp':
      return formatPower(value, units, language);
    case 'torque_nm':
      return formatTorque(value, units, language);
    case 'max_speed_kmh':
      return formatSpeed(value, units, language);
    case 'weight_kg':
      return formatWeight(value, units, language);
    case 'acceleration_0_100':
      return `${new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(value)} s`;
    case 'ip':
      return `${new Intl.NumberFormat(language, { maximumFractionDigits: 0 }).format(value)} IP`;
  }
}

/** Source of truth for all battle-card values is the match snapshot. */
export function battleCardStats(snapshot: BattleVehicleSnapshot) {
  return {
    power_hp: snapshot.stats.power_hp,
    torque_nm: snapshot.stats.torque_nm,
    max_speed_kmh: snapshot.stats.max_speed_kmh,
    acceleration_0_100: snapshot.stats.acceleration_0_100,
    // Card accepts the historic weight_t field in either kg or tonnes.
    weight_t: snapshot.stats.weight_kg,
  };
}
