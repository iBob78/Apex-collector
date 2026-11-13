import { parsePilotPalmares, pilotTrophies, type PilotBattleStats } from '../palmares';

const stats: PilotBattleStats = {
  battles: 12, wins: 10, losses: 1, draws: 1, winRate: 83.3,
  bestStreak: 7, currentStreak: 3, bestScore: 10,
  perfectWins: 1, earnedAc: 2500, boostersEarned: 1,
};
const rounds = Array.from({ length: 10 }, (_, index) => ({
  roundNumber: index + 1,
  stat: 'power_hp',
  player1Value: 600,
  player2Value: 550,
  winner: 'player1',
}));
const source = {
  available: true, isOwner: true, stats,
  topWinner: {
    cardId: 'car-1', make: 'Ferrari', model: 'F40', year: '1989',
    imageUrl: null, roundsWon: 18, timesUsed: 25,
  },
  mostUsed: null,
  history: [{
    id: 'match-1', finishedAt: '2026-11-13T10:00:00Z',
    winner: 'player1', playerPoints: 10, opponentPoints: 0, rounds,
  }],
};

describe('Apex Battle V1 pilot palmares', () => {
  it('shows six permanent trophies based on recorded wins and scores', () => {
    expect(pilotTrophies(stats).map((t) => [t.id, t.unlocked])).toEqual([
      ['first', true], ['fighter', true], ['veteran', false],
      ['champion', false], ['legend', false], ['perfect', true],
    ]);
    expect(pilotTrophies({ ...stats, wins: 100, perfectWins: 0 })
      .map((t) => t.unlocked)).toEqual([true, true, true, true, true, false]);
  });

  it('shows full private last-20 history and earned credits to owner', () => {
    const result = parsePilotPalmares(source, false);
    expect(result?.stats.earnedAc).toBe(2500);
    expect(result?.topWinner?.model).toBe('F40');
    expect(result?.history[0]).toMatchObject({
      playerPoints: 10, opponentPoints: 0,
    });
    expect(result?.history[0].rounds).toHaveLength(10);
  });

  it('does not expose detailed history or AC earnings in public component', () => {
    const result = parsePilotPalmares(source, true);
    expect(result?.isOwner).toBe(false);
    expect(result?.history).toEqual([]);
    expect(result?.stats.earnedAc).toBeNull();
    expect(result?.stats.wins).toBe(10);
    expect(result?.topWinner?.make).toBe('Ferrari');
  });

  it('limits private history to 20 matches even if a server sends more', () => {
    const many = { ...source, history: Array.from({ length: 25 }, (_, i) =>
      ({ ...source.history[0], id: 'm-' + i })) };
    expect(parsePilotPalmares(many, false)?.history).toHaveLength(20);
  });

  it('rejects unavailable private showroom and missing stats', () => {
    expect(parsePilotPalmares({ available: false, stats }, true)).toBeNull();
    expect(parsePilotPalmares({ available: true }, false)).toBeNull();
    expect(parsePilotPalmares(null, false)).toBeNull();
  });

  it('ignores invalid or partial rounds in personal history', () => {
    const broken = {
      ...source,
      history: [{ ...source.history[0], rounds: rounds.slice(0, 9) }],
    };
    expect(parsePilotPalmares(broken, false)?.history).toEqual([]);
  });

  it('handles a new player with zero recorded matches', () => {
    const empty = { available: true, isOwner: true,
      stats: { ...stats, battles: 0, wins: 0, losses: 0, draws: 0,
        winRate: 0, bestScore: 0, currentStreak: 0, perfectWins: 0 },
      topWinner: null, mostUsed: null, history: [] };
    const data = parsePilotPalmares(empty, false);
    expect(data?.stats.battles).toBe(0);
    expect(pilotTrophies(data!.stats).every((t) => !t.unlocked)).toBe(true);
  });
});
