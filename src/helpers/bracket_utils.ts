// functions for players

import { Document } from 'mongoose';
import { AthleteInterface } from '../schemas/Athlete';
import { MatchInterface } from '../schemas/Match';
import { TournamentInterface } from '../schemas/Tournament';
import { Match } from '../schemas';

type RoundT = ((MatchInterface & Document) | null)[];
type BracketT = RoundT[];

// math functions

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

export function getNextPlayerIdx (idx: number) {
  return idx % 2;
}

// bracket functions

/**
 * generates a bracket from the players with at least 1 round
 */
export function generateMainBracket (tournament: TournamentInterface, players: AthleteInterface[]): BracketT {
  const rounds_count = getRoundsCount(Math.max(players.length, 2));
  const bracket: BracketT = [];
  // create the required rounds, each with the required matches
  for (let round_idx = 0; round_idx < rounds_count; round_idx++) {
    const matches_count = getMatchesCount(round_idx, rounds_count);
    const round = [];
    for (let match_idx = 0; match_idx < matches_count; match_idx++) {
      round.push(null);
    }
    bracket.push(round);
  }
  // populate the first round
  const r0_matches_count = getMatchesCount(0, rounds_count);
  for (let match_idx = 0; match_idx < r0_matches_count; match_idx++) {
    const match = new Match({
      red_athlete: players[match_idx]?._id ?? null,
      white_athlete: players[match_idx + r0_matches_count]?._id ?? null,
      winner_athlete: null,
      tournament: tournament._id,
      is_started: false,
      is_over: false,
      match_type: 0,
      loser_recovered: false,
      match_scores: {
        final_time: 0,
        white_ippon: 0,
        white_wazaari: 0,
        white_penalties: 0,
        red_ippon: 0,
        red_wazaari: 0,
        red_penalties: 0
      }
    });
    bracket[0][match_idx] = match;
  }

  return bracket;
}

/**
 * propagates the loser recovered status to previous matches
 */
async function propagateLoserRecovered (bracket: BracketT, round_idx: number, idx: number) {
  while (round_idx >= 0) {
    const match = bracket[round_idx][idx] as Document & MatchInterface;
    if (!match) {
      throw Error('Malformed bracket');
    }
    match.loser_recovered = true;
    await match.save();
    const players = [match.white_athlete, match.red_athlete];
    const winner_idx = players.findIndex(player => player && player.equals(match.winner_athlete));
    if (winner_idx === -1) {
      throw Error('winner_idx not found while propagating recovered');
    }
    idx = getPrevMatchIdx(idx, winner_idx);
    round_idx -= 1;
  }
  return bracket;
}

/**
 * calculates a victory and returns a new bracket
 */
export async function calculateVictory (bracket: BracketT, round_idx: number, idx: number): Promise<BracketT> {
  const match = bracket[round_idx][idx];
  const players = [match.white_athlete, match.red_athlete];
  const winner_idx = players.findIndex(player => player && player.equals(match.winner_athlete));
  if (winner_idx === -1) {
    throw Error('Winner idx not found');
  }
  // if the player reached the quarter finals, recover the losers
  let loser_recovered = false;
  if (bracket.length - round_idx === 3) {
    // quarter finals
    loser_recovered = true;
  }

  // update the next match
  if (round_idx + 1 < bracket.length) {
    const next_match_idx = getNextMatchIdx(idx);
    const next_match: Document & MatchInterface = bracket[round_idx + 1][next_match_idx] ?? new Match({
      white_athlete: null,
      red_athlete: null,
      winner_athlete: null,
      tournament: match.tournament._id,
      is_started: false,
      is_over: false,
      match_type: 0,
      loser_recovered: false,
      match_scores: {
        final_time: 0,
        white_ippon: 0,
        white_wazaari: 0,
        white_penalties: 0,
        red_ippon: 0,
        red_wazaari: 0,
        red_penalties: 0
      }
    });
    // set the player in the next match
    if (getNextPlayerIdx(idx) === 0) {
      next_match.white_athlete = match.winner_athlete;
    } else {
      next_match.red_athlete = match.winner_athlete;
    }

    await next_match.save();

    bracket[round_idx + 1][next_match_idx] = next_match;
  }

  if (loser_recovered) {
    // propagate the loser recovered status
    await propagateLoserRecovered(bracket, round_idx, idx);
  }

  return bracket;
}
