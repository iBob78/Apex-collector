import {
  BATTLE_STATS,
  getAvailableBattleStats,
  getBattleScore,
  getNextBattleChooser,
  normalizeBattleVehicle,
  type BattleMatchState,
  type BattleRound,
  type BattleStat,
  type BattleVehicleSource,
} from './engine';

export type TrainingReward = {
  ac: number;
  boosterSlug: 'common' | 'uncommon' | null;
  winsTotal: number;
  winsToNext: number;
};

export type TrainingStart = { battleId: string; winsTotal: number };

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function parseTrainingStart(value: unknown): TrainingStart {
  const data = record(value);
  if (!data || data.success !== true || typeof data.battle_id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.battle_id) ||
      !Number.isSafeInteger(data.wins_total) || Number(data.wins_total) < 0) {
    throw new Error('Le serveur n’a pas confirmé la création de la partie.');
  }
  // Deliberately no opponent IDs. The next bot card is confidential until reveal.
  return { battleId: data.battle_id, winsTotal: Number(data.wins_total) };
}

/** Client state tracks only revealed bot cards. It never holds future bot stats. */
export function createHiddenTrainingMatch(playerSources: readonly BattleVehicleSource[]): BattleMatchState {
  if (playerSources.length !== 10) throw new Error('Sélectionne dix voitures.');
  const player1Deck = playerSources.map(normalizeBattleVehicle);
  return {
    firstChooser: 'player1',
    player1Deck,
    player2Deck: player1Deck.map((card, index) => ({
      cardId: 'hidden-' + index,
      canonicalCardId: 'hidden-' + index,
      stats: { ...card.stats },
    })),
    rounds: [],
  };
}

/**
 * Only the server can commit a rewarded round. Verify it against current card
 * and rules before showing it, never accept client-computed points or awards.
 */
export function reconcileTrainingRound<T extends BattleVehicleSource>(
  response: unknown,
  match: BattleMatchState,
  catalog: readonly T[],
  chooser: 'player1' | 'player2',
  requested?: BattleStat,
): { match: BattleMatchState; opponent: T; reward: TrainingReward | null } {
  const payload = record(response);
  const serverRound = record(payload?.round);
  const serverScore = record(payload?.score);
  if (!payload || payload.success !== true || !serverRound || !serverScore) {
    throw new Error('Le serveur n’a pas confirmé cette manche.');
  }
  const index = match.rounds.length;
  const expectedChooser = getNextBattleChooser(match);
  const stat = serverRound.stat as BattleStat;
  if (index >= 10 || expectedChooser !== chooser || serverRound.roundNumber !== index + 1 ||
      serverRound.selectedBy !== chooser ||
      (chooser === 'player1' && stat !== requested) ||
      !getAvailableBattleStats(match).includes(stat) ||
      serverRound.player1CardId !== match.player1Deck[index].cardId ||
      typeof serverRound.player2CardId !== 'string') {
    throw new Error('La manche reçue ne correspond pas au tour en cours.');
  }
  const opponent = catalog.find((card) => card.card_id.toLowerCase() ===
    String(serverRound.player2CardId).toLowerCase());
  if (!opponent) throw new Error('La carte adverse n’est plus dans le catalogue.');

  const bot = normalizeBattleVehicle(opponent);
  const player = match.player1Deck[index];
  const v1 = player.stats[stat];
  const v2 = bot.stats[stat];
  const better = BATTLE_STATS[stat].better;
  const winner: BattleRound['winner'] = v1 === v2 ? 'tie' :
    better === 'higher' ? (v1 > v2 ? 'player1' : 'player2')
      : (v1 < v2 ? 'player1' : 'player2');
  const p1 = winner === 'tie' ? 0.5 : winner === 'player1' ? 1 : 0;
  const p2 = 1 - p1;

  if (serverRound.winner !== winner ||
      serverRound.player1Points !== p1 ||
      serverRound.player2Points !== p2 ||
      !Number.isFinite(Number(serverRound.player1Value)) ||
      !Number.isFinite(Number(serverRound.player2Value)) ||
      Math.abs(Number(serverRound.player1Value) - v1) > 0.001 ||
      Math.abs(Number(serverRound.player2Value) - v2) > 0.001) {
    throw new Error('Le serveur a renvoyé des valeurs incohérentes. Recommence une partie.');
  }

  const round: BattleRound = {
    roundNumber: index + 1, selectedBy: chooser, stat,
    player1CardId: player.cardId, player2CardId: bot.cardId,
    player1Value: v1, player2Value: v2, winner,
    player1Points: p1, player2Points: p2,
  };
  const opponentDeck = match.player2Deck.slice();
  opponentDeck[index] = bot;
  const nextMatch: BattleMatchState = {
    ...match,
    player2Deck: opponentDeck,
    rounds: [...match.rounds, round],
  };
  const nextScore = getBattleScore(nextMatch);
  if (Number(serverScore.player1) !== nextScore.player1 ||
      Number(serverScore.player2) !== nextScore.player2 ||
      serverScore.finished !== nextScore.finished ||
      serverScore.winner !== nextScore.winner) {
    throw new Error('Les points du serveur ne correspondent pas aux manches validées.');
  }

  if (!nextScore.finished) return { match: nextMatch, opponent, reward: null };
  const rawReward = record(payload.reward);
  if (!rawReward ||
      !Number.isSafeInteger(rawReward.ac) || ![0, 250].includes(Number(rawReward.ac)) ||
      !Number.isSafeInteger(rawReward.wins_total) || Number(rawReward.wins_total) < 0 ||
      !Number.isSafeInteger(rawReward.wins_to_next) ||
      Number(rawReward.wins_to_next) < 1 || Number(rawReward.wins_to_next) > 10 ||
      (rawReward.booster_slug !== null && rawReward.booster_slug !== 'common' && rawReward.booster_slug !== 'uncommon') ||
      (nextScore.winner === 'player1' ? rawReward.ac !== 250 : rawReward.ac !== 0) ||
      (rawReward.booster_slug !== null &&
        (nextScore.winner !== 'player1' || Number(rawReward.wins_total) % 10 !== 0))) {
    throw new Error('La récompense n’a pas été confirmée correctement.');
  }
  return {
    match: nextMatch,
    opponent,
    reward: {
      ac: Number(rawReward.ac),
      boosterSlug: rawReward.booster_slug as TrainingReward['boosterSlug'],
      winsTotal: Number(rawReward.wins_total),
      winsToNext: Number(rawReward.wins_to_next),
    },
  };
}

/** Local non-rewarded preview fallback; never used to choose rewarded opponents. */
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
