export type PilotBattleStats = {
  battles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  bestStreak: number;
  currentStreak: number;
  bestScore: number;
  perfectWins: number;
  earnedAc: number | null;
  boostersEarned: number;
};

export type PilotBattleCar = {
  cardId: string;
  make: string;
  model: string;
  year: string | null;
  imageUrl: string | null;
  roundsWon: number;
  timesUsed: number;
};

export type PilotBattleRound = {
  roundNumber: number;
  stat: string;
  winner: 'player1' | 'player2' | 'tie';
  player1Value: number;
  player2Value: number;
};

export type PilotBattleHistory = {
  id: string;
  finishedAt: string;
  winner: 'player1' | 'player2' | 'tie';
  playerPoints: number;
  opponentPoints: number;
  rounds: PilotBattleRound[];
};

export type PilotPalmares = {
  isOwner: boolean;
  stats: PilotBattleStats;
  topWinner: PilotBattleCar | null;
  mostUsed: PilotBattleCar | null;
  history: PilotBattleHistory[];
};

type TrophyRequirement = { id: string; name: string; description: string; unlocked: boolean };

export function pilotTrophies(stats: PilotBattleStats): TrophyRequirement[] {
  return [
    { id: 'first', name: 'Première victoire', description: '1 victoire', unlocked: stats.wins >= 1 },
    { id: 'fighter', name: 'Combattant', description: '10 victoires', unlocked: stats.wins >= 10 },
    { id: 'veteran', name: 'Vétéran', description: '25 victoires', unlocked: stats.wins >= 25 },
    { id: 'champion', name: 'Champion', description: '50 victoires', unlocked: stats.wins >= 50 },
    { id: 'legend', name: 'Légende', description: '100 victoires', unlocked: stats.wins >= 100 },
    { id: 'perfect', name: 'Imbattable', description: 'Une victoire 10–0', unlocked: stats.perfectWins >= 1 },
  ];
}

function obj(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}
function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
function validWinner(value: unknown): PilotBattleHistory['winner'] | null {
  return value === 'player1' || value === 'player2' || value === 'tie' ? value : null;
}
function car(value: unknown): PilotBattleCar | null {
  const x = obj(value);
  if (!x || typeof x.cardId !== 'string') return null;
  return {
    cardId: x.cardId,
    make: typeof x.make === 'string' ? x.make : 'Voiture',
    model: typeof x.model === 'string' ? x.model : 'indisponible',
    year: typeof x.year === 'string' ? x.year : null,
    imageUrl: typeof x.imageUrl === 'string' ? x.imageUrl : null,
    roundsWon: num(x.roundsWon),
    timesUsed: num(x.timesUsed),
  };
}
function round(value: unknown): PilotBattleRound | null {
  const x = obj(value);
  if (!x || !validWinner(x.winner) || typeof x.stat !== 'string') return null;
  return {
    roundNumber: num(x.roundNumber),
    stat: x.stat,
    winner: validWinner(x.winner)!,
    player1Value: num(x.player1Value),
    player2Value: num(x.player2Value),
  };
}
function battle(value: unknown): PilotBattleHistory | null {
  const x = obj(value);
  if (!x || typeof x.id !== 'string' || typeof x.finishedAt !== 'string' ||
      !validWinner(x.winner) || !Array.isArray(x.rounds)) return null;
  const rounds = x.rounds.map(round).filter((r): r is PilotBattleRound => r !== null);
  if (rounds.length !== 10) return null;
  return {
    id: x.id,
    finishedAt: x.finishedAt,
    winner: validWinner(x.winner)!,
    playerPoints: num(x.playerPoints),
    opponentPoints: num(x.opponentPoints),
    rounds,
  };
}

/** The public component never presents a player's AC earnings or detailed matches. */
export function parsePilotPalmares(value: unknown, publicView: boolean): PilotPalmares | null {
  const x = obj(value);
  if (!x || x.available !== true) return null;
  const raw = obj(x.stats);
  if (!raw) return null;
  const stats: PilotBattleStats = {
    battles: num(raw.battles),
    wins: num(raw.wins),
    losses: num(raw.losses),
    draws: num(raw.draws),
    winRate: num(raw.winRate),
    bestStreak: num(raw.bestStreak),
    currentStreak: num(raw.currentStreak),
    bestScore: num(raw.bestScore),
    perfectWins: num(raw.perfectWins),
    earnedAc: publicView ? null : raw.earnedAc == null ? null : num(raw.earnedAc),
    boostersEarned: num(raw.boostersEarned),
  };
  const history = !publicView && x.isOwner === true && Array.isArray(x.history)
    ? x.history.slice(0, 20).map(battle).filter((b): b is PilotBattleHistory => b !== null)
    : [];
  return {
    isOwner: !publicView && x.isOwner === true,
    stats,
    topWinner: car(x.topWinner),
    mostUsed: car(x.mostUsed),
    history,
  };
}
