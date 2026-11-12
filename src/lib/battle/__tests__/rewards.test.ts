import {
  isMissingTrainingRpc,
  opponentSourcesFromIds,
  parseTrainingStart,
  verifyTrainingRound,
} from '../rewards';
import type { BattleRound } from '../engine';

const ids = Array.from({ length: 10 }, (_, index) =>
  '00000000-0000-4000-8000-' + String(index + 1).padStart(12, '0'));
const round: BattleRound = {
  roundNumber: 10,
  selectedBy: 'player2',
  stat: 'torque_nm',
  player1CardId: ids[0],
  player2CardId: ids[1],
  player1Value: 300,
  player2Value: 350,
  winner: 'player2',
  player1Points: 0,
  player2Points: 1,
};

describe('Apex Battle — secure training reward confirmation', () => {
  it('accepts ten server-selected opponent cards with match id', () => {
    const response = parseTrainingStart({
      success: true, battle_id: ids[2], opponent_ids: ids, wins_total: 9,
    });
    expect(response.opponentIds).toHaveLength(10);
    expect(response.winsTotal).toBe(9);
  });

  it('rejects missing or forged start fields', () => {
    expect(() => parseTrainingStart({ success: true, battle_id: 'x', opponent_ids: ids })).toThrow();
    expect(() => parseTrainingStart({ success: true, battle_id: ids[2], opponent_ids: ids.slice(0, 9), wins_total: 0 })).toThrow();
    expect(() => parseTrainingStart({ success: false, battle_id: ids[2], opponent_ids: ids, wins_total: 0 })).toThrow();
  });

  it('never silently accepts client-computed score when server values differ', () => {
    const base = {
      success: true,
      round,
      score: { player1: 3, player2: 7, finished: true, winner: 'player2' },
      reward: { ac: 0, booster_slug: null, wins_total: 9, wins_to_next: 1 },
    };
    expect(verifyTrainingRound(base, round, true)).toEqual({
      ac: 0, boosterSlug: null, winsTotal: 9, winsToNext: 1,
    });
    expect(() => verifyTrainingRound({
      ...base, round: { ...round, player1Value: 10000 },
    }, round, true)).toThrow();
    expect(() => verifyTrainingRound({
      ...base, round: { ...round, winner: 'player1' },
    }, round, true)).toThrow();
    expect(() => verifyTrainingRound({
      ...base, reward: { ac: 999999, booster_slug: null, wins_total: 9, wins_to_next: 1 },
    }, round, true)).toThrow();
  });

  it('accepts exactly a Common/Uncommon 10-win gift and 250 AC', () => {
    const winRound = { ...round, winner: 'player1', player1Points: 1, player2Points: 0 };
    const response = {
      success: true,
      round: winRound,
      score: { player1: 6, player2: 4, finished: true, winner: 'player1' },
      reward: { ac: 250, booster_slug: 'uncommon', wins_total: 10, wins_to_next: 10 },
    };
    expect(verifyTrainingRound(response, winRound, true)).toEqual({
      ac: 250, boosterSlug: 'uncommon', winsTotal: 10, winsToNext: 10,
    });
    expect(() => verifyTrainingRound({
      ...response, reward: { ...response.reward, booster_slug: 'mythic' },
    }, winRound, true)).toThrow();
  });

  it('uses no rewards for incomplete rounds', () => {
    expect(verifyTrainingRound({
      success: true,
      round: { ...round, roundNumber: 1 },
      score: { player1: 0, player2: 1, finished: false, winner: null },
    }, { ...round, roundNumber: 1 }, false)).toBeNull();
  });

  it('matches catalog opponents and rejects mismatched id sets', () => {
    const catalog = ids.map((id) => ({
      card_id: id, power_hp: 250, torque_nm: 300,
      max_speed_kmh: 240, acceleration_0_100: 6, weight_t: 1.3,
    }));
    expect(opponentSourcesFromIds(ids, catalog).map((item) => item.card_id)).toEqual(ids);
    expect(() => opponentSourcesFromIds([...ids.slice(0, 9), 'unknown'], catalog)).toThrow();
  });

  it('permits uncredited legacy practice only when the RPC is not yet installed', () => {
    expect(isMissingTrainingRpc({ code: 'PGRST202' })).toBe(true);
    expect(isMissingTrainingRpc({ code: '42883' })).toBe(true);
    expect(isMissingTrainingRpc({ code: '42501' })).toBe(false);
    expect(isMissingTrainingRpc(null)).toBe(false);
  });
});
