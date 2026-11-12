import {
  BATTLE_DECK_SIZE,
  BattleVehicleSource,
  createBattleMatch,
  getAvailableBattleStats,
  getBattleScore,
  getNextBattleChooser,
  playBattleRound,
} from '../engine';
import { chooseTrainingStat, createTrainingOpponent, startTrainingMatch } from '../training';

function car(id: number, patch: Partial<BattleVehicleSource> = {}): BattleVehicleSource {
  return {
    card_id: 'car-' + id,
    power_hp: 250 + id,
    torque_nm: 340 + id,
    max_speed_kmh: 235 + id,
    acceleration_0_100: 6.5,
    weight_t: 1.25,
    variant_of_card_id: null,
    ...patch,
  };
}

const playerDeck = Array.from({ length: BATTLE_DECK_SIZE }, (_, i) => car(i + 1));
const allCars = Array.from({ length: 50 }, (_, i) => car(i + 1));

describe('Apex Battle training', () => {
  it('selects ten unique cars from the catalog, never the player selected models', () => {
    const opponent = createTrainingOpponent(playerDeck, allCars);
    const playerIds = new Set(playerDeck.map((item) => item.card_id));
    expect(opponent).toHaveLength(10);
    expect(new Set(opponent.map((item) => item.card_id)).size).toBe(10);
    expect(opponent.every((item) => !playerIds.has(item.card_id))).toBe(true);
  });

  it('is deterministic for the same catalog and deck', () => {
    const first = createTrainingOpponent(playerDeck, allCars);
    const second = createTrainingOpponent(playerDeck, allCars);
    expect(first.map((item) => item.card_id)).toEqual(second.map((item) => item.card_id));
  });

  it('does not use another alternative art of a selected model', () => {
    const catalog = [...allCars, car(100, { variant_of_card_id: 'car-1', power_hp: 251 })];
    const opponent = createTrainingOpponent(playerDeck, catalog);
    expect(opponent).not.toContainEqual(expect.objectContaining({ card_id: 'car-100' }));
  });

  it('rejects an incomplete deck or insufficient candidate models', () => {
    expect(() => createTrainingOpponent(playerDeck.slice(0, 9), allCars)).toThrow();
    expect(() => createTrainingOpponent(playerDeck, allCars.slice(0, 12))).toThrow('Pas assez');
  });

  it('starts a complete ten-round match with first choice assigned to player', () => {
    const { match, opponent } = startTrainingMatch(playerDeck, allCars);
    expect(opponent).toHaveLength(10);
    expect(match.player1Deck).toHaveLength(10);
    expect(match.player2Deck).toHaveLength(10);
    expect(getNextBattleChooser(match)).toBe('player1');
    expect(getBattleScore(match).finished).toBe(false);
  });

  it('refuses bot action outside bot turn and chooses from its own current stats', () => {
    const opponent = Array.from({ length: 10 }, (_, i) =>
      car(100 + i, { acceleration_0_100: 2.1, power_hp: 250, torque_nm: 300, max_speed_kmh: 220, weight_t: 1.5 }));
    const match = createBattleMatch(playerDeck, opponent, 'player1');
    expect(() => chooseTrainingStat(match)).toThrow('ordinateur');
    const second = playBattleRound(match, 'player1', 'power_hp');
    expect(chooseTrainingStat(second)).toBe('acceleration_0_100');
    const third = playBattleRound(second, 'player2', chooseTrainingStat(second));
    expect(getBattleScore(third).completedRounds).toBe(2);
  });

  it('respects the per-player maximum of two choices for one statistic', () => {
    const opponent = Array.from({ length: 10 }, (_, i) =>
      car(100 + i, { acceleration_0_100: 2.1, power_hp: 250, torque_nm: 300, max_speed_kmh: 220, weight_t: 1.5 }));
    let match = createBattleMatch(playerDeck, opponent, 'player1');

    for (let i = 0; i < 2; i++) {
      match = playBattleRound(match, 'player1', 'power_hp');
      expect(chooseTrainingStat(match)).toBe('acceleration_0_100');
      match = playBattleRound(match, 'player2', chooseTrainingStat(match));
    }
    match = playBattleRound(match, 'player1', 'torque_nm');
    expect(getAvailableBattleStats(match)).not.toContain('acceleration_0_100');
    expect(chooseTrainingStat(match)).not.toBe('acceleration_0_100');
  });

  it('completes a full solo game without awards or external state', () => {
    const initial = startTrainingMatch(playerDeck, allCars);
    let match = initial.match;
    while (!getBattleScore(match).finished) {
      const chooser = getNextBattleChooser(match);
      const stat = chooser === 'player2' ? chooseTrainingStat(match) : getAvailableBattleStats(match)[0];
      match = playBattleRound(match, chooser!, stat);
    }
    const score = getBattleScore(match);
    expect(score.completedRounds).toBe(10);
    expect(score.player1 + score.player2).toBe(10);
    expect(['player1', 'player2', 'tie']).toContain(score.winner);
  });
});
