/* eslint-disable @typescript-eslint/naming-convention */

import mongoose, { Document, Types } from 'mongoose';
import { MatchInterface, Match } from '../schemas/Match';
import { TournamentInterface } from '../schemas/Tournament';

export type PlayerT = Types.ObjectId;
export interface MatchT {
  players: (PlayerT | null)[];
  winnerIdx: number | null;
  loserRecovered: boolean;
}
export type RoundT = (MatchT | null)[]
export type BracketT = RoundT[];
export interface BracketsT {
  main: BracketT;
  recovery: [BracketT, BracketT];
}

/**
 * function to convert a JIC bracket to a utils bracket
 * to handle the logic of victory and recovery
 */
export function toUtilsBracket (bracket: MatchInterface[][]): BracketT {
  return bracket.map(round => {
    return round.map(match => {
      if (match === null) {
        return null;
      }
      const players = [
        match.white_athlete?._id ?? null,
        match.red_athlete?._id ?? null
      ];
      let winnerIdx: number | null = null;
      if (match.winner_athlete !== null) {
        winnerIdx = match.winner_athlete.equals(players[0]) ? 0 : 1;
      }
      return {
        winnerIdx,
        players,
        loserRecovered: match.loser_recovered,
      };
    });
  });
}

/**
 * converts a utils bracket to a JIC bracket
 * the original data is required to fill in the gaps
 */
export function toJicBracket(
  bracket: BracketT,
  tournament: TournamentInterface,
  jicBracket?: (MatchInterface & Document)[][],
): MatchInterface[][] {
  return bracket.map((round, roundIdx) => {
    return round.map((match, matchIdx) => {
      if (match === null) {
        return null;
      }
      const originalMatch: MatchInterface = jicBracket?.[roundIdx]?.[matchIdx]?.toObject() ?? {
        // white_athlete: null,
        // red_athlete: null,
        // winner_athlete: null,
        // loser_recovered: null,
        tournament: tournament._id,
        is_started: false,
        is_over: false,
        match_type: 0,
        match_scores: {
          final_time: 0,
          white_ippon: 0,
          white_wazaari: 0,
          white_penalties: 0,
          red_ippon: 0,
          red_wazaari: 0,
          red_penalties: 0
        }
      } as MatchInterface;
      return {
        ...originalMatch,
        loser_recovered: match.loserRecovered,
        white_athlete: match.players[0],
        red_athlete: match.players[1],
        winner_athlete: match.winnerIdx
          ? match.players[match.winnerIdx]
          : null
      };
    });
  });
}

export async function storeJicBrackets (
  tournament: TournamentInterface & Document,
  winners_bracket: MatchInterface[][],
  recovered_bracket_1: MatchInterface[][],
  recovered_bracket_2: MatchInterface[][],
) {
  // fetch all of the matches from the tournament
  const all_matches = [
    ...winners_bracket.flat().flat(),
    ...recovered_bracket_1.flat().flat(),
    ...recovered_bracket_2.flat().flat(),
  ].filter(match => match !== null).map(match => {
    if (match._id === undefined) {
      match._id = new mongoose.mongo.ObjectId() as Types.ObjectId;
    }
    return match;
  });
  await Match.bulkWrite(all_matches.map(
    match => ({
      updateOne: {
        filter: { _id: match._id },
        update: match,
        upsert: true
      }
    })
  ));
  tournament.winners_bracket = winners_bracket.map(
    round => round.map(match => match === null ? null : match._id)
  );
  tournament.recovered_bracket_1 = recovered_bracket_1.map(
    round => round.map(match => match === null ? null : match._id)
  );
  tournament.recovered_bracket_2 = recovered_bracket_2.map(
    round => round.map(match => match === null ? null : match._id)
  );
  await tournament.save();
}

const recoveryBracketIdentifiers = ['A', 'B', 'C', 'D'] as const;
type RecoveryBracketIdentifierT = 'A' | 'B' | 'C' | 'D';
interface RecoveryBracketLocation {
  recoveryBracketIdx: number;
  roundIdx: number;
  idx: number;
  playerIdx: number;
}

// math functions

function isQuarterFinals (roundIdx: number, roundsCount: number): boolean {
  return roundsCount - roundIdx === 3;
}

function isSemiFinals (roundIdx: number, roundsCount: number): boolean {
  return roundsCount - roundIdx === 2;
}

function isFinals (roundIdx: number, roundsCount: number): boolean {
  return roundsCount - roundIdx === 1;
}

export function getRoundsCount (playersCount: number): number {
  return Math.ceil(Math.log2(playersCount));
}

export function getMatchesCount (roundIdx: number, roundsCount: number): number {
  return Math.pow(2, roundsCount - roundIdx - 1);
}

export function getNextMatchIdx (idx: number): number {
  return Math.floor(idx / 2);
}

export function getPrevMatchIdx (idx: number, playerIdx: number): number {
  return idx * 2 + playerIdx;
}

/**
 * how many rounds does each recovery bracket contain
 */
export function getRecoveryBracketRoundsCount (roundsCount: number): number {
  // init   - initial round taking from r0
  // mid    - more rounds taking from r1+
  // merge  - 1 round merging A-B, C-D
  // finals - 1 round finding 3° place
  if (roundsCount < 3) {
    throw Error('Cannot create recovery bracket with less than 3 rounds');
  }
  return roundsCount - 1;
}

// bracket functions

/**
 * gets the recovery bracket for an identifier
 * note: opposite bracket for semi finalists
 */
export function getRecoveryBracketIdx (
  identifier: RecoveryBracketIdentifierT,
  isSemiFinals = false
): 0 | 1 {
  let usesTopBracket = ['A', 'B'].includes(identifier);
  if (isSemiFinals) {
    usesTopBracket = !usesTopBracket;
  }
  return usesTopBracket ? 0 : 1;
}

/**
 * returns the recovery bracket identifier (A, B, C, D)
 * based on the round where a player is recovered
 */
export function getRecoveryBracketIdentifier (
  roundIdx: number,
  roundsCount: number,
  idx: number,
  playerIdx: number
): RecoveryBracketIdentifierT {
  if (isFinals(roundIdx, roundsCount)) {
    throw new Error('cannot get recovery bracket identifiers of finals');
  }
  const playerOrder = 2 * idx + playerIdx;
  const normalizedPlayerOrder = playerOrder / (2 * getMatchesCount(roundIdx, roundsCount));
  const identifierIdx = Math.floor(recoveryBracketIdentifiers.length * normalizedPlayerOrder);
  return recoveryBracketIdentifiers[identifierIdx];
}

/**
 * various places in the main bracket can be mapped to a location
 * in the recovery bracket
 */
export function getRecoveryBracketLocation (
  roundIdx: number,
  roundsCount: number,
  idx: number
): RecoveryBracketLocation {
  if (roundsCount < 3) {
    throw new Error('No recovery brackets required');
  }
  if (isFinals(roundIdx, roundsCount)) {
    throw new Error('Finalists cannot be recovered');
  }

  const recoveryRoundsCount = getRecoveryBracketRoundsCount(roundsCount);
  const identifier = getRecoveryBracketIdentifier(
    roundIdx, roundsCount, idx, 0
  );
  const recoveryBracketIdx = getRecoveryBracketIdx(
    identifier,
    isSemiFinals(roundIdx, roundsCount)
  );
  if (isSemiFinals(roundIdx, roundsCount)) {
    return {
      recoveryBracketIdx,
      roundIdx: recoveryRoundsCount - 1, // finals 3-5
      idx: 0, // final match
      playerIdx: 1 // second player
    };
  }
  // the index in the recovery bracket can be calculated
  // based on the target round and the branch being used
  const recoveryRoundIdx = Math.max(roundIdx - 1, 0);
  const usesSecondaryBranch = ['B', 'D'].includes(identifier);

  if (roundsCount === 3) {
    // if the bracket is too small the rules change slightly
    return {
      recoveryBracketIdx,
      roundIdx: recoveryRoundIdx,
      idx: 0,
      playerIdx: usesSecondaryBranch ? 1 : 0
    };
  }

  // the main branch is always 0, the secondary branch uses powers of two
  const recoveryIdx = usesSecondaryBranch
    ? Math.pow(2, recoveryRoundsCount - recoveryRoundIdx - 3)
    : 0;
  return {
    recoveryBracketIdx,
    roundIdx: recoveryRoundIdx,
    idx: recoveryIdx,
    // first round initializes player with playerIdx 0, otherwise always 1
    playerIdx: (roundIdx === 0) ? 0 : 1,
  };
}

/**
 * generates a bracket full of null values based on the number of rounds
 * e.g. with 3 rounds
 * [
 *  [null, null, null, null],
 *  [null, null],
 *  [null],
 * ]
 */
function generateEmptyBracket (roundsCount: number): BracketT {
  const bracket: BracketT = [];
  // create the required rounds, each with the required matches
  for (let roundIdx = 0; roundIdx < roundsCount; roundIdx++) {
    const matchesCount = getMatchesCount(roundIdx, roundsCount);
    const round = [];
    for (let matchIdx = 0; matchIdx < matchesCount; matchIdx++) {
      round.push(null);
    }
    bracket.push(round);
  }
  return bracket;
}

/**
 * initial victories need to be assigned to avoid having matches
 * with a single player
 *
 * warning: only use in initial bracket creation
 */
function assignInitialVictories (mainBracket: BracketT): BracketT {
  for (let matchIdx = 0; matchIdx < mainBracket[0].length; matchIdx++) {
    if (mainBracket[0][matchIdx].players[1] === null) {
      mainBracket = calculateVictory(mainBracket, 0, matchIdx, 0);
    }
  }
  return mainBracket;
}

/**
 * generates a bracket from the players with at least 1 round
 */
export function generateMainBracket (players: PlayerT[]): BracketT {
  const roundsCount = getRoundsCount(Math.max(players.length, 2));
  const bracket: BracketT = generateEmptyBracket(roundsCount);
  // populate the first round
  const r0MatchesCount = getMatchesCount(0, roundsCount);
  for (let matchIdx = 0; matchIdx < r0MatchesCount; matchIdx++) {
    bracket[0][matchIdx] = {
      players: [
        players[matchIdx] ?? null,
        players[matchIdx + r0MatchesCount] ?? null
      ],
      winnerIdx: null,
      loserRecovered: false
    };
  }

  if (players.length === 0) {
    return bracket;
  }
  return assignInitialVictories(bracket);
}

/**
 * generates the main and the recovery brackets
 */
export function generateBrackets (players: PlayerT[]): BracketsT {
  const main = generateMainBracket(players);
  let recoveryRoundsCount = 0;
  try {
    recoveryRoundsCount = getRecoveryBracketRoundsCount(main.length);
  } catch (error) {
    // no recovery brackets can be created
    return {
      main,
      recovery: [[], []]
    };
  }
  return {
    main,
    recovery: [
      generateEmptyBracket(recoveryRoundsCount),
      generateEmptyBracket(recoveryRoundsCount),
    ]
  };
}

/**
 * calculates a victory and returns a new bracket
 */
export function calculateVictory (bracket: BracketT, roundIdx: number, idx: number, winnerIdx: number): BracketT {
  const match = bracket[roundIdx][idx];
  // note: this does not check whether all prev matches have been played
  if (!match || match.winnerIdx !== null) {
    // unset match or match with already set winner
    throw new Error('Unplayable match');
  }
  const winner = match.players[winnerIdx];
  if (winner === null) {
    // empty player was selected
    throw new Error('Invalid selected player');
  }
  const newBracket = [...bracket];

  // update the current match
  newBracket[roundIdx] = [...newBracket[roundIdx]];
  newBracket[roundIdx][idx] = {
    ...match,
    winnerIdx
  };

  // update the next match
  if (roundIdx + 1 < newBracket.length) {
    const nextMatchIdx = getNextMatchIdx(idx);
    const nextMatch: MatchT = setMatchPlayer(newBracket[roundIdx + 1][nextMatchIdx], winner, idx % 2);
    newBracket[roundIdx + 1] = [...newBracket[roundIdx + 1]];
    newBracket[roundIdx + 1][nextMatchIdx] = nextMatch;
  }

  return newBracket;
}

export function calculateMainVictory (brackets: BracketsT, roundIdx: number, idx: number, winnerIdx: number): BracketsT {
  brackets = { ...brackets };
  brackets.main = calculateVictory(brackets.main, roundIdx, idx, winnerIdx);
  if (brackets.recovery[0].length === 0) {
    // no recovery brackets
    return brackets;
  }
  return recoverLosers(brackets, roundIdx, idx);
}

/**
 * updates the match to contain a player at the specified index
 */
function setMatchPlayer (match: MatchT | null, player: PlayerT, playerIdx: number): MatchT {
  match = match ?? {
    players: [null, null],
    loserRecovered: false,
    winnerIdx: null,
  };
  const newPlayers = [...match.players];
  if (newPlayers[playerIdx] !== null) {
    throw Error('Rewriting player in match');
  }
  newPlayers[playerIdx] = player;
  return { ...match, players: newPlayers };
}

/**
 * recovers the losers from the main bracket to the recovery brackets:
 * - whoever lost against the winner of quarter finals is recovered
 * - the loser from semifinals is recovered
 */
export function recoverLosers (brackets: BracketsT, roundIdx: number, idx: number): BracketsT {
  // if the player reached the quarter finals, recover the losers
  if (brackets.recovery[0].length === 0) {
    throw new Error('Cannot recover losers if recovery brackets are missing');
  }
  const newBrackets = { ...brackets };
  newBrackets.main = [...newBrackets.main];
  newBrackets.recovery = [
    [...brackets.recovery[0]],
    [...brackets.recovery[1]],
  ];
  const mainBracket = newBrackets.main;
  const recoveryBrackets = newBrackets.recovery;

  if (isQuarterFinals(roundIdx, mainBracket.length)) {
    // propagate the loser recovered status
    while (roundIdx >= 0) {
      const match = mainBracket[roundIdx][idx];
      if (match === null) {
        throw Error('Found unset match while propagating recovered status');
      }
      if (match.winnerIdx === null) {
        throw Error('Found match with unset winner while propagating recovered status');
      }
      mainBracket[roundIdx] = [...mainBracket[roundIdx]];
      mainBracket[roundIdx][idx] = {
        ...match,
        loserRecovered: true
      };

      // find the location for the recovered player
      const loser = match.players[1 - match.winnerIdx];
      if (loser !== null) {
        const recLoc = getRecoveryBracketLocation(roundIdx, mainBracket.length, idx);
        recoveryBrackets[recLoc.recoveryBracketIdx] = [...recoveryBrackets[recLoc.recoveryBracketIdx]];
        recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx] =
          [...recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx]];
        const nextMatch: MatchT = setMatchPlayer(
          recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx][recLoc.idx],
          loser, recLoc.playerIdx
        );
        recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx][recLoc.idx] = nextMatch;
      }

      roundIdx -= 1;
      idx = getPrevMatchIdx(idx, match.winnerIdx!);
    }

    return newBrackets;
  }
  if (isSemiFinals(roundIdx, mainBracket.length)) {
    // loser is moved to the opposite losers bracket
    const match = { ...mainBracket[roundIdx][idx]! };
    mainBracket[roundIdx][idx] = {
      ...match,
      loserRecovered: true
    };
    if (match.winnerIdx === null) {
      throw Error('Found match with unset winner while recovering loser');
    }

    const loser = match.players[1 - match.winnerIdx!];
    if (loser !== null) {
      const recLoc = getRecoveryBracketLocation(roundIdx, mainBracket.length, idx);
      recoveryBrackets[recLoc.recoveryBracketIdx] = [...recoveryBrackets[recLoc.recoveryBracketIdx]];
      recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx] =
        [...recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx]];
      const nextMatch: MatchT = setMatchPlayer(
        recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx][recLoc.idx],
        loser,
        recLoc.playerIdx
      );
      recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx][recLoc.idx] = nextMatch;
    }
    return newBrackets;
  }
  return brackets;
}

/**
 * returns the overall winner from the final match
 */
export function getBracketWinner (bracket: BracketT): PlayerT | null {
  const finalMatch = bracket[bracket.length - 1][0];
  const winner = finalMatch !== null && finalMatch.winnerIdx !== null
    ? finalMatch.players[finalMatch.winnerIdx]
    : null;
  return winner;
}
