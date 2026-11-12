import type { BattleRound, BattleVehicleSource } from './engine';

export type TrainingReward = {
  ac: number;
  boosterSlug: 'common' | 'uncommon' | null;
  winsTotal: number;
  winsToNext: number;
};

type StartResponse = {
  battleId: string;
  opponentIds: string[];
  winsTotal: number;
};

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/** Never trust untyped RPC responses to drive a rewarded game blindly. */
export function parseTrainingStart(value: unknown): StartResponse {
  const data = record(value);
  if (!data || data.success !== true || typeof data.battle_id !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(data.battle_id) ||
      !Array.isArray(data.opponent_ids) || data.opponent_ids.length !== 10 ||
      !data.opponent_ids.every((id) => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)) ||
      !Number.isSafeInteger(data.wins_total) || Number(data.wins_total) < 0) {
    throw new Error('Le serveur n’a pas confirmé une équipe de dix cartes valide.');
  }
  return {
    battleId: data.battle_id,
    opponentIds: data.opponent_ids as string[],
    winsTotal: Number(data.wins_total),
  };
}

export function verifyTrainingRound(
  response: unknown,
  expected: BattleRound,
  isFinal: boolean,
): TrainingReward | null {
  const payload = record(response);
  const serverRound = record(payload?.round);
  const serverScore = record(payload?.score);
  if (!payload || payload.success !== true || !serverRound || !serverScore ||
      serverRound.roundNumber !== expected.roundNumber ||
      serverRound.selectedBy !== expected.selectedBy ||
      serverRound.stat !== expected.stat ||
      serverRound.player1CardId !== expected.player1CardId ||
      serverRound.player2CardId !== expected.player2CardId ||
      serverRound.winner !== expected.winner ||
      Math.abs(Number(serverRound.player1Value) - expected.player1Value) > 0.001 ||
      Math.abs(Number(serverRound.player2Value) - expected.player2Value) > 0.001 ||
      serverRound.player1Points !== expected.player1Points ||
      serverRound.player2Points !== expected.player2Points ||
      serverScore.finished !== isFinal ||
      (isFinal && serverScore.winner !==
        (serverScore.player1 === serverScore.player2 ? 'tie'
          : Number(serverScore.player1) > Number(serverScore.player2) ? 'player1' : 'player2'))) {
    throw new Error('Le serveur a renvoyé un résultat différent. Recommence une partie pour préserver les AC.');
  }

  if (!isFinal) return null;
  const reward = record(payload.reward);
  if (!reward ||
      !Number.isSafeInteger(reward.ac) || ![0, 250].includes(Number(reward.ac)) ||
      !Number.isSafeInteger(reward.wins_total) || Number(reward.wins_total) < 0 ||
      !Number.isSafeInteger(reward.wins_to_next) || Number(reward.wins_to_next) < 1 ||
      Number(reward.wins_to_next) > 10 ||
      (reward.booster_slug !== null && reward.booster_slug !== 'common' && reward.booster_slug !== 'uncommon')) {
    throw new Error('Le serveur n’a pas confirmé la récompense.');
  }
  return {
    ac: Number(reward.ac),
    boosterSlug: reward.booster_slug as TrainingReward['boosterSlug'],
    winsTotal: Number(reward.wins_total),
    winsToNext: Number(reward.wins_to_next),
  };
}

/** Keep visual cards tied to a server-selected catalog entry, not client-submitted bot data. */
export function opponentSourcesFromIds<T extends BattleVehicleSource>(
  opponentIds: readonly string[],
  catalog: readonly T[],
): T[] {
  const byId = new Map(catalog.map((card) => [card.card_id.toLowerCase(), card]));
  const result = opponentIds.map((id) => byId.get(id.toLowerCase()));
  if (result.some((card) => !card)) {
    throw new Error('Les cartes adverses ne figurent plus dans le catalogue.');
  }
  return result as T[];
}

export function isMissingTrainingRpc(error: { code?: string } | null): boolean {
  return error?.code === 'PGRST202' || error?.code === '42883';
}
