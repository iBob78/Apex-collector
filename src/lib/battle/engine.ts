/**
 * Apex Battle — moteur de règles pur (sans accès aux comptes, à Supabase ou aux AC).
 *
 * IMPORTANT : un BattleMatchState contient les deux decks et ne doit JAMAIS être
 * envoyé intégralement au navigateur tant que les cartes adverses sont secrètes.
 * Les actions serveur de la future PR multijoueur devront créer une vue filtrée.
 */
import { calculateVehicleIP } from '../vehicleStats';

export const BATTLE_DECK_SIZE = 10;
export const BATTLE_MAX_CHOICES_PER_STAT = 2;

export type BattlePlayer = 'player1' | 'player2';
export type BattleWinner = BattlePlayer | 'tie';
export type BattleStat =
  | 'power_hp'
  | 'torque_nm'
  | 'max_speed_kmh'
  | 'acceleration_0_100'
  | 'weight_kg'
  | 'ip';

export const BATTLE_STATS: Readonly<Record<BattleStat, {
  label: string;
  unit: string;
  better: 'higher' | 'lower';
}>> = {
  power_hp: { label: 'Puissance', unit: 'ch', better: 'higher' },
  torque_nm: { label: 'Couple', unit: 'Nm', better: 'higher' },
  max_speed_kmh: { label: 'Vitesse maximale', unit: 'km/h', better: 'higher' },
  acceleration_0_100: { label: '0–100 km/h', unit: 's', better: 'lower' },
  weight_kg: { label: 'Masse', unit: 'kg', better: 'lower' },
  ip: { label: 'Indice de performance', unit: 'IP', better: 'higher' },
};

export const BATTLE_STAT_KEYS = Object.freeze(Object.keys(BATTLE_STATS) as BattleStat[]);

type StatValue = number | string | null | undefined;

/** Source telle qu'elle apparaît dans la table `cards` du catalogue. */
export type BattleVehicleSource = {
  card_id: string;
  variant_of_card_id?: string | null;
  power_hp: StatValue;
  torque_nm: StatValue;
  max_speed_kmh: StatValue;
  acceleration_0_100: StatValue;
  weight_t: StatValue;
};

/** Instantané à persister quand les deux joueurs verrouillent leurs decks. */
export type BattleVehicleSnapshot = {
  cardId: string;
  canonicalCardId: string;
  stats: Readonly<Record<BattleStat, number>>;
};

export type BattleDeckValidation =
  | { ok: true; cards: readonly BattleVehicleSnapshot[] }
  | { ok: false; errors: readonly string[] };

export type BattleRound = {
  roundNumber: number;
  selectedBy: BattlePlayer;
  stat: BattleStat;
  player1CardId: string;
  player2CardId: string;
  player1Value: number;
  player2Value: number;
  winner: BattleWinner;
  player1Points: number;
  player2Points: number;
};

/** À conserver côté serveur uniquement, car il contient les cartes cachées. */
export type BattleMatchState = {
  firstChooser: BattlePlayer;
  player1Deck: readonly BattleVehicleSnapshot[];
  player2Deck: readonly BattleVehicleSnapshot[];
  rounds: readonly BattleRound[];
};

export type BattleScore = {
  player1: number;
  player2: number;
  completedRounds: number;
  finished: boolean;
  winner: BattleWinner | null;
};

const NUMERIC_VALUE = /^\d+(?:[.,]\d+)?$/;

/** Refuse les chaînes ambiguës comme "1 235" ou les nombres non finis. */
function parsePositive(value: StatValue): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const raw = typeof value === 'string' ? value.trim() : value;
  if (typeof raw === 'string' && !NUMERIC_VALUE.test(raw)) return null;
  const parsed = typeof raw === 'number' ? raw : Number(raw.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Compatibilité avec le catalogue historique : `weight_t` contient normalement
 * des tonnes, mais quelques fiches contiennent des kg entiers (ex : "1235").
 * Les valeurs 5–50 incluses côté kg/tonnes sont ambiguës et refusées.
 */
function normalizeMassKg(value: StatValue): number | null {
  const raw = parsePositive(value);
  if (raw === null) return null;
  if (raw >= 0.1 && raw <= 5) return raw * 1000;
  if (raw > 50 && raw <= 5000) return raw;
  return null;
}

/**
 * Normalise les statistiques depuis le catalogue, sans inventer les données
 * manquantes. L'IP réutilise la définition déjà employée dans la collection.
 */
export function normalizeBattleVehicle(source: BattleVehicleSource): BattleVehicleSnapshot {
  if (!source || typeof source.card_id !== 'string' || !source.card_id.trim()) {
    throw new Error('Identifiant de carte invalide.');
  }

  const power = parsePositive(source.power_hp);
  const torque = parsePositive(source.torque_nm);
  const vmax = parsePositive(source.max_speed_kmh);
  const acceleration = parsePositive(source.acceleration_0_100);
  const massKg = normalizeMassKg(source.weight_t);

  if (power === null || torque === null || vmax === null || acceleration === null || massKg === null) {
    throw new Error(`Statistiques manquantes ou invalides pour la carte ${source.card_id}.`);
  }
  if (vmax < 100) {
    throw new Error(`La carte ${source.card_id} n'atteint pas 100 km/h : le 0–100 n'est pas comparable.`);
  }
  const ip = calculateVehicleIP(power, massKg);
  if (!Number.isFinite(ip) || ip <= 0) {
    throw new Error(`Indice de performance invalide pour la carte ${source.card_id}.`);
  }

  return {
    cardId: source.card_id.trim(),
    canonicalCardId: source.variant_of_card_id?.trim() || source.card_id.trim(),
    stats: {
      power_hp: power,
      torque_nm: torque,
      max_speed_kmh: vmax,
      acceleration_0_100: acceleration,
      weight_kg: massKg,
      ip,
    },
  };
}

/**
 * Valide exactement dix véhicules distincts. Deux alternative arts d'un même
 * véhicule source ne peuvent pas être utilisés comme deux modèles différents.
 * La possession et l'activation en catalogue sont à vérifier côté serveur.
 */
export function validateBattleDeck(sources: readonly BattleVehicleSource[]): BattleDeckValidation {
  if (!Array.isArray(sources) || sources.length !== BATTLE_DECK_SIZE) {
    return { ok: false, errors: [`Un deck doit contenir exactement ${BATTLE_DECK_SIZE} véhicules.`] };
  }

  const cards: BattleVehicleSnapshot[] = [];
  const errors: string[] = [];
  const seenCardIds = new Set<string>();
  const seenCanonicalIds = new Set<string>();

  sources.forEach((source, index) => {
    try {
      const card = normalizeBattleVehicle(source);
      if (seenCardIds.has(card.cardId)) {
        errors.push(`Emplacement ${index + 1} : carte déjà sélectionnée (${card.cardId}).`);
      } else if (seenCanonicalIds.has(card.canonicalCardId)) {
        errors.push(`Emplacement ${index + 1} : modèle déjà sélectionné (${card.canonicalCardId}).`);
      } else {
        seenCardIds.add(card.cardId);
        seenCanonicalIds.add(card.canonicalCardId);
        cards.push(card);
      }
    } catch (error) {
      errors.push(`Emplacement ${index + 1} : ${error instanceof Error ? error.message : 'Carte invalide.'}`);
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, cards };
}

/** La première personne qui choisit est décidée et stockée par le serveur. */
export function createBattleMatch(
  player1: readonly BattleVehicleSource[],
  player2: readonly BattleVehicleSource[],
  firstChooser: BattlePlayer,
): BattleMatchState {
  if (firstChooser !== 'player1' && firstChooser !== 'player2') {
    throw new Error('Premier joueur invalide.');
  }
  const deck1 = validateBattleDeck(player1);
  const deck2 = validateBattleDeck(player2);
  if (!deck1.ok || !deck2.ok) {
    const issues = [...(deck1.ok ? [] : deck1.errors), ...(deck2.ok ? [] : deck2.errors)];
    throw new Error(issues.join(' '));
  }
  return { firstChooser, player1Deck: deck1.cards, player2Deck: deck2.cards, rounds: [] };
}

export function getNextBattleChooser(match: BattleMatchState): BattlePlayer | null {
  if (match.rounds.length >= BATTLE_DECK_SIZE) return null;
  if (match.rounds.length % 2 === 0) return match.firstChooser;
  return match.firstChooser === 'player1' ? 'player2' : 'player1';
}

export function getAvailableBattleStats(match: BattleMatchState): readonly BattleStat[] {
  const chooser = getNextBattleChooser(match);
  if (!chooser) return [];
  return BATTLE_STAT_KEYS.filter((stat) =>
    match.rounds.filter((round) => round.selectedBy === chooser && round.stat === stat).length
      < BATTLE_MAX_CHOICES_PER_STAT,
  );
}

/**
 * Une sélection validée = une manche. Ne renvoie PAS cet état brut au client :
 * il contient encore les prochains véhicules adverses non dévoilés.
 */
export function playBattleRound(match: BattleMatchState, selectedBy: BattlePlayer, stat: BattleStat): BattleMatchState {
  const expectedChooser = getNextBattleChooser(match);
  if (!expectedChooser) throw new Error('La bataille est déjà terminée.');
  if (selectedBy !== expectedChooser) throw new Error("Ce n'est pas le tour de ce joueur.");
  if (!Object.prototype.hasOwnProperty.call(BATTLE_STATS, stat)) {
    throw new Error('Caractéristique inconnue.');
  }
  if (!getAvailableBattleStats(match).includes(stat)) {
    throw new Error('Limite de deux choix atteinte pour cette caractéristique.');
  }

  const roundIndex = match.rounds.length;
  const card1 = match.player1Deck[roundIndex];
  const card2 = match.player2Deck[roundIndex];
  if (!card1 || !card2) throw new Error('Deck incomplet.');
  const value1 = card1.stats[stat];
  const value2 = card2.stats[stat];
  const comparator = BATTLE_STATS[stat].better;
  const cmp = value1 === value2 ? 0 : comparator === 'higher'
    ? value1 > value2 ? 1 : -1
    : value1 < value2 ? 1 : -1;
  const winner: BattleWinner = cmp > 0 ? 'player1' : cmp < 0 ? 'player2' : 'tie';
  const round: BattleRound = {
    roundNumber: roundIndex + 1,
    selectedBy,
    stat,
    player1CardId: card1.cardId,
    player2CardId: card2.cardId,
    player1Value: value1,
    player2Value: value2,
    winner,
    player1Points: winner === 'tie' ? 0.5 : winner === 'player1' ? 1 : 0,
    player2Points: winner === 'tie' ? 0.5 : winner === 'player2' ? 1 : 0,
  };
  return { ...match, rounds: [...match.rounds, round] };
}

export function getBattleScore(match: BattleMatchState): BattleScore {
  const player1 = match.rounds.reduce((sum, round) => sum + round.player1Points, 0);
  const player2 = match.rounds.reduce((sum, round) => sum + round.player2Points, 0);
  const finished = match.rounds.length === BATTLE_DECK_SIZE;
  return {
    player1,
    player2,
    completedRounds: match.rounds.length,
    finished,
    winner: finished ? player1 === player2 ? 'tie' : player1 > player2 ? 'player1' : 'player2' : null,
  };
}
