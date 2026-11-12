/**
 * Apex Battle — mode entraînement uniquement.
 * Aucune écriture Supabase, aucun crédit AC, aucun défi multijoueur.
 */
import {
  BATTLE_DECK_SIZE,
  BATTLE_STATS,
  BattleMatchState,
  BattleStat,
  BattleVehicleSource,
  createBattleMatch,
  getAvailableBattleStats,
  getNextBattleChooser,
  normalizeBattleVehicle,
  validateBattleDeck,
} from './engine';

/** Sélectionne un adversaire de niveau voisin, sans utiliser deux fois un modèle. */
export function createTrainingOpponent(
  playerSources: readonly BattleVehicleSource[],
  catalog: readonly BattleVehicleSource[],
): BattleVehicleSource[] {
  const validation = validateBattleDeck(playerSources);
  if (!validation.ok) throw new Error(validation.errors.join(' '));

  const forbidden = new Set(validation.cards.map((card) => card.canonicalCardId.toLowerCase()));
  const candidates = catalog.flatMap((source) => {
    try {
      const snapshot = normalizeBattleVehicle(source);
      return [{ source, snapshot }];
    } catch {
      return [];
    }
  });
  const picked: BattleVehicleSource[] = [];

  validation.cards.forEach((playerCard, index) => {
    const nearby = candidates
      .filter(({ snapshot }) => !forbidden.has(snapshot.canonicalCardId.toLowerCase()))
      .sort((a, b) => {
        const aDistance = Math.abs(Math.log(a.snapshot.stats.ip / playerCard.stats.ip));
        const bDistance = Math.abs(Math.log(b.snapshot.stats.ip / playerCard.stats.ip));
        return aDistance - bDistance || a.snapshot.cardId.localeCompare(b.snapshot.cardId);
      });
    if (!nearby.length) {
      throw new Error('Pas assez de voitures différentes dans le catalogue pour l’entraînement.');
    }
    // Une variation de difficulté fixe évite de sélectionner toujours le voisin immédiat.
    // Elle reste déterministe pour une même sélection et un même catalogue.
    const rank = (index * 7 + 3) % Math.min(10, nearby.length);
    const chosen = nearby[rank];
    picked.push(chosen.source);
    forbidden.add(chosen.snapshot.canonicalCardId.toLowerCase());
  });

  if (picked.length !== BATTLE_DECK_SIZE) throw new Error('Adversaire incomplet.');
  return picked;
}

const STAT_BASELINES: Readonly<Record<BattleStat, number>> = {
  power_hp: 250,
  torque_nm: 350,
  max_speed_kmh: 240,
  acceleration_0_100: 7,
  weight_kg: 1300,
  ip: 200,
};

/**
 * L'ordinateur choisit la meilleure statistique de sa propre carte uniquement.
 * Il ne regarde jamais la carte du joueur avant le résultat de la manche.
 */
export function chooseTrainingStat(match: BattleMatchState): BattleStat {
  if (getNextBattleChooser(match) !== 'player2') {
    throw new Error("Ce n'est pas au tour de l'ordinateur.");
  }
  const card = match.player2Deck[match.rounds.length];
  const available = getAvailableBattleStats(match);
  if (!card || !available.length) throw new Error('Tour indisponible.');

  return available.reduce((best, stat) => {
    const value = card.stats[stat];
    const baseline = STAT_BASELINES[stat];
    const strength = BATTLE_STATS[stat].better === 'higher' ? value / baseline : baseline / value;
    const bestValue = card.stats[best];
    const bestBaseline = STAT_BASELINES[best];
    const bestStrength = BATTLE_STATS[best].better === 'higher'
      ? bestValue / bestBaseline
      : bestBaseline / bestValue;
    return strength > bestStrength ? stat : best;
  }, available[0]);
}

/** Une partie d'entraînement démarre avec les choix du joueur en premier. */
export function startTrainingMatch(
  playerSources: readonly BattleVehicleSource[],
  catalog: readonly BattleVehicleSource[],
): { match: BattleMatchState; opponent: BattleVehicleSource[] } {
  const opponent = createTrainingOpponent(playerSources, catalog);
  return { opponent, match: createBattleMatch(playerSources, opponent, 'player1') };
}
