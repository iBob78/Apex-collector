import {
  createHiddenTrainingMatch,
  isMissingTrainingRpc,
  parseTrainingStart,
  reconcileTrainingRound,
} from '../rewards';
import type { BattleRound, BattleStat } from '../engine';

const ids = Array.from({ length: 20 }, (_, index) =>
  '00000000-0000-4000-8000-' + String(index + 1).padStart(12, '0'));

function card(id: string, hp = 300) {
  return {
    card_id: id, power_hp: hp, torque_nm: hp + 100,
    max_speed_kmh: hp, acceleration_0_100: 6,
    weight_t: '1.5', variant_of_card_id: null,
  };
}
const player = ids.slice(0, 10).map((id) => card(id, 300));
const catalog = ids.slice(10).map((id) => card(id, 250));

function firstRound() {
  return {
    roundNumber: 1,
    selectedBy: 'player1',
    stat: 'power_hp',
    player1CardId: ids[0],
    player2CardId: ids[10],
    player1Value: 300,
    player2Value: 250,
    winner: 'player1',
    player1Points: 1,
    player2Points: 0,
  };
}

describe('Apex Battle — secure training reward confirmation', () => {
  it('accepts match IDs but never receives the hidden opponent team', () => {
    const response = parseTrainingStart({
      success: true, battle_id: ids[2], wins_total: 9,
    });
    expect(response).toEqual({ battleId: ids[2], winsTotal: 9 });
    const match = createHiddenTrainingMatch(player);
    expect(match.player2Deck.every((item) => item.cardId.startsWith('hidden-'))).toBe(true);
    expect(match.rounds).toHaveLength(0);
  });

  it('rejects an incomplete start response', () => {
    expect(() => parseTrainingStart({ success: true, battle_id: 'x', wins_total: 0 })).toThrow();
    expect(() => parseTrainingStart({ success: false, battle_id: ids[2], wins_total: 0 })).toThrow();
    expect(() => parseTrainingStart({ success: true, battle_id: ids[2] })).toThrow();
  });

  it('accepts and reveals only the bot card from the completed round', () => {
    const state = createHiddenTrainingMatch(player);
    const result = reconcileTrainingRound({
      success: true, round: firstRound(),
      score: { player1: 1, player2: 0, finished: false, winner: null },
    }, state, catalog, 'player1', 'power_hp');
    expect(result.match.rounds).toHaveLength(1);
    expect(result.match.player2Deck[0].cardId).toBe(ids[10]);
    expect(result.match.player2Deck[1].cardId).toBe('hidden-1');
    expect(result.reward).toBeNull();
  });

  it('rejects manipulated values, unavailable cards, and false winners', () => {
    const state = createHiddenTrainingMatch(player);
    const base = {
      success: true, round: firstRound(),
      score: { player1: 1, player2: 0, finished: false, winner: null },
    };
    expect(() => reconcileTrainingRound({
      ...base, round: { ...firstRound(), player2Value: 1 },
    }, state, catalog, 'player1', 'power_hp')).toThrow();
    expect(() => reconcileTrainingRound({
      ...base, round: { ...firstRound(), winner: 'player2' },
    }, state, catalog, 'player1', 'power_hp')).toThrow();
    expect(() => reconcileTrainingRound({
      ...base, score: { ...base.score, player1: 100 },
    }, state, catalog, 'player1', 'power_hp')).toThrow();
    expect(() => reconcileTrainingRound({
      ...base, round: { ...firstRound(), player2CardId: 'unknown' },
    }, state, catalog, 'player1', 'power_hp')).toThrow();
  });

  it('accepts the 10th victory and a Common/Uncommon six-card gift only from the server', () => {
    const initial = createHiddenTrainingMatch(player);
    const old: BattleRound[] = Array.from({ length: 9 }, (_, i) => ({
      roundNumber: i + 1,
      selectedBy: i % 2 === 0 ? 'player1' : 'player2',
      stat: (['power_hp', 'torque_nm', 'max_speed_kmh', 'acceleration_0_100', 'weight_kg'] as BattleStat[])[Math.floor(i / 2)],
      player1CardId: ids[i], player2CardId: ids[i + 10],
      player1Value: 300, player2Value: 250,
      winner: i < 6 ? 'player1' : 'player2',
      player1Points: i < 6 ? 1 : 0,
      player2Points: i < 6 ? 0 : 1,
    }));
    const state = { ...initial, rounds: old };
    const response = {
      success: true,
      round: {
        roundNumber: 10, selectedBy: 'player2', stat: 'max_speed_kmh',
        player1CardId: ids[9], player2CardId: ids[19],
        player1Value: 300, player2Value: 250,
        winner: 'player1', player1Points: 1, player2Points: 0,
      },
      score: { player1: 7, player2: 3, finished: true, winner: 'player1' },
      reward: { ac: 250, booster_slug: 'common', wins_total: 10, wins_to_next: 10 },
    };
    expect(reconcileTrainingRound(response, state, catalog, 'player2').reward).toEqual({
      ac: 250, boosterSlug: 'common', winsTotal: 10, winsToNext: 10,
    });
    expect(() => reconcileTrainingRound({
      ...response, reward: { ...response.reward, booster_slug: 'mythic' },
    }, state, catalog, 'player2')).toThrow();
  });

  it('keeps unrewarded practice available only when the RPC is missing', () => {
    expect(isMissingTrainingRpc({ code: 'PGRST202' })).toBe(true);
    expect(isMissingTrainingRpc({ code: '42883' })).toBe(true);
    expect(isMissingTrainingRpc({ code: '42501' })).toBe(false);
    expect(isMissingTrainingRpc(null)).toBe(false);
  });
});
