import {
  BATTLE_DECK_SIZE,
  BATTLE_MAX_CHOICES_PER_STAT,
  BATTLE_STAT_KEYS,
  createBattleMatch,
  getAvailableBattleStats,
  getBattleScore,
  getNextBattleChooser,
  normalizeBattleVehicle,
  playBattleRound,
  validateBattleDeck,
  type BattlePlayer,
  type BattleStat,
  type BattleVehicleSource,
} from '../engine';

const car = (id: string, overrides: Partial<BattleVehicleSource> = {}): BattleVehicleSource => ({
  card_id: id,
  power_hp: 250,
  torque_nm: 300,
  max_speed_kmh: 250,
  acceleration_0_100: 5.5,
  weight_t: 1.25,
  ...overrides,
});
const deck = (prefix: string, overrides: Partial<BattleVehicleSource> = {}) =>
  Array.from({ length: BATTLE_DECK_SIZE }, (_, i) => car(`${prefix}-${i + 1}`, overrides));

const match = (a?: Partial<BattleVehicleSource>, b?: Partial<BattleVehicleSource>, first: BattlePlayer = 'player1') =>
  createBattleMatch(deck('a', a), deck('b', b), first);

describe('Apex Battle — données véhicule', () => {
  it('normalise les tonnes et les kg sans modifier le calcul IP existant', () => {
    const tonnes = normalizeBattleVehicle(car('f40', { power_hp: 471, weight_t: '1,235' }));
    const kilos = normalizeBattleVehicle(car('f40', { power_hp: '471', weight_t: '1235' }));
    expect(tonnes.stats.weight_kg).toBe(1235);
    expect(kilos.stats.weight_kg).toBe(1235);
    expect(tonnes.stats.ip).toBe(381);
    expect(kilos.stats.ip).toBe(381);
  });

  it('convertit les décimales avec virgule sans inventer de statistiques', () => {
    const snapshot = normalizeBattleVehicle(car('x', { acceleration_0_100: '8,3', torque_nm: '310,5' }));
    expect(snapshot.stats.acceleration_0_100).toBe(8.3);
    expect(snapshot.stats.torque_nm).toBe(310.5);
  });

  it.each([null, '', 'pas connu', -1, 0, Number.NaN, Infinity])(
    'refuse une puissance invalide : %s',
    (power) => expect(() => normalizeBattleVehicle(car('x', { power_hp: power }))).toThrow(/invalides/),
  );

  it('refuse une masse ambiguë et des valeurs qui ne décrivent pas un 0–100 valide', () => {
    expect(() => normalizeBattleVehicle(car('x', { weight_t: '20' }))).toThrow(/invalides/);
    expect(() => normalizeBattleVehicle(car('x', { weight_t: '1 235' }))).toThrow(/invalides/);
    expect(() => normalizeBattleVehicle(car('x', { max_speed_kmh: '95' }))).toThrow(/100 km\/h/);
  });

  it('refuse un deck incomplet ou qui contient deux copies du même véhicule', () => {
    expect(validateBattleDeck(deck('a').slice(0, 9)).ok).toBe(false);
    const duplicate = deck('a');
    duplicate[9] = car('a-1');
    expect(validateBattleDeck(duplicate)).toMatchObject({ ok: false });
  });

  it('refuse de doubler un modèle en utilisant une alternative art', () => {
    const alternate = deck('a');
    alternate[9] = car('special-art', { variant_of_card_id: 'a-1' });
    const result = validateBattleDeck(alternate);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/modèle déjà sélectionné/);
  });
});

describe('Apex Battle — manches et tours', () => {
  it('compare la puissance dans le sens le plus grand gagne', () => {
    const before = match({ power_hp: 400 }, { power_hp: 200 });
    const after = playBattleRound(before, 'player1', 'power_hp');
    expect(after.rounds[0]).toMatchObject({ winner: 'player1', player1Value: 400, player2Value: 200, player1Points: 1 });
    expect(before.rounds).toHaveLength(0);
    expect(after.rounds).toHaveLength(1);
  });

  it.each<BattleStat>(['acceleration_0_100', 'weight_kg'])(
    'compare %s dans le sens la plus petite valeur gagne',
    (stat) => {
      const first = match({ acceleration_0_100: 4, weight_t: 1.1 }, { acceleration_0_100: 6, weight_t: 1.6 });
      expect(playBattleRound(first, 'player1', stat).rounds[0].winner).toBe('player1');
    },
  );

  it.each<BattleStat>(['torque_nm', 'max_speed_kmh', 'ip'])(
    'compare %s dans le sens la plus grande valeur gagne',
    (stat) => {
      const first = match(
        { power_hp: 400, torque_nm: 500, max_speed_kmh: 310 },
        { power_hp: 200, torque_nm: 300, max_speed_kmh: 250 },
      );
      expect(playBattleRound(first, 'player1', stat).rounds[0].winner).toBe('player1');
    },
  );

  it('accorde 0,5 point à chaque joueur si les statistiques sont égales', () => {
    const result = playBattleRound(match(), 'player1', 'power_hp').rounds[0];
    expect(result).toMatchObject({ winner: 'tie', player1Points: 0.5, player2Points: 0.5 });
  });

  it('alterne le choix à chaque manche, indépendamment du résultat', () => {
    let game = match({ power_hp: 400 }, { power_hp: 200 }, 'player2');
    expect(getNextBattleChooser(game)).toBe('player2');
    game = playBattleRound(game, 'player2', 'power_hp');
    expect(game.rounds[0].winner).toBe('player1');
    expect(getNextBattleChooser(game)).toBe('player1');
    expect(() => playBattleRound(game, 'player2', 'ip')).toThrow(/pas le tour/);
    game = playBattleRound(game, 'player1', 'ip');
    expect(getNextBattleChooser(game)).toBe('player2');
  });

  it('limite les choix d’une caractéristique à 2 par joueur (et non par match)', () => {
    let game = match();
    game = playBattleRound(game, 'player1', 'power_hp');
    game = playBattleRound(game, 'player2', 'power_hp');
    game = playBattleRound(game, 'player1', 'power_hp');
    game = playBattleRound(game, 'player2', 'power_hp');
    expect(BATTLE_MAX_CHOICES_PER_STAT).toBe(2);
    expect(getAvailableBattleStats(game)).not.toContain('power_hp');
    expect(() => playBattleRound(game, 'player1', 'power_hp')).toThrow(/Limite/);
    game = playBattleRound(game, 'player1', 'ip');
    expect(getAvailableBattleStats(game)).not.toContain('power_hp');
  });

  it('traite exactement 10 manches, et interdit une onzième', () => {
    let game = match(
      { power_hp: 400, torque_nm: 500, max_speed_kmh: 310, acceleration_0_100: 4, weight_t: 1.1 },
      { power_hp: 200, torque_nm: 250, max_speed_kmh: 230, acceleration_0_100: 7, weight_t: 1.5 },
    );
    for (let i = 0; i < 10; i++) {
      const chooser = getNextBattleChooser(game);
      expect(chooser).not.toBeNull();
      const stat = BATTLE_STAT_KEYS[Math.floor(i / 2) % BATTLE_STAT_KEYS.length];
      game = playBattleRound(game, chooser!, stat);
    }
    expect(getBattleScore(game)).toMatchObject({ player1: 10, player2: 0, completedRounds: 10, finished: true, winner: 'player1' });
    expect(getNextBattleChooser(game)).toBeNull();
    expect(getAvailableBattleStats(game)).toHaveLength(0);
    expect(() => playBattleRound(game, 'player1', 'ip')).toThrow(/déjà terminée/);
  });

  it('termine à 5-5 lorsqu’un joueur remporte une manche sur deux', () => {
    const team1 = deck('a').map((c, i) => ({ ...c, power_hp: i % 2 === 0 ? 400 : 200,
      torque_nm: i % 2 === 0 ? 500 : 250, max_speed_kmh: i % 2 === 0 ? 310 : 230,
      acceleration_0_100: i % 2 === 0 ? 4 : 7, weight_t: i % 2 === 0 ? 1.1 : 1.5 }));
    const team2 = deck('b').map((c, i) => ({ ...c, power_hp: i % 2 === 0 ? 200 : 400,
      torque_nm: i % 2 === 0 ? 250 : 500, max_speed_kmh: i % 2 === 0 ? 230 : 310,
      acceleration_0_100: i % 2 === 0 ? 7 : 4, weight_t: i % 2 === 0 ? 1.5 : 1.1 }));
    let game = createBattleMatch(team1, team2, 'player1');
    for (let i = 0; i < 10; i++) {
      game = playBattleRound(game, getNextBattleChooser(game)!, BATTLE_STAT_KEYS[Math.floor(i / 2)]);
    }
    expect(getBattleScore(game)).toMatchObject({ player1: 5, player2: 5, winner: 'tie' });
  });

  it('refuse une caractéristique inconnue et un premier joueur invalide', () => {
    expect(() => playBattleRound(match(), 'player1', 'color' as BattleStat)).toThrow(/inconnue/);
    expect(() => createBattleMatch(deck('a'), deck('b'), 'neither' as BattlePlayer)).toThrow(/invalide/);
  });

  it('une bataille de voitures identiques se termine à 5-5 avec des demi-points', () => {
    let game = match();
    for (let i = 0; i < 10; i++) {
      game = playBattleRound(game, getNextBattleChooser(game)!, BATTLE_STAT_KEYS[Math.floor(i / 2)]);
    }
    expect(getBattleScore(game)).toMatchObject({ player1: 5, player2: 5, winner: 'tie' });
  });
});
