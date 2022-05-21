// functions for players

import { AthleteInterface } from '../schemas/Athlete';
import { MatchInterface } from '../schemas/Match';
import { TournamentInterface } from '../schemas/Tournament';

type RoundT = MatchInterface[];
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
    const match: MatchInterface = {
      red_athlete: players[match_idx]?._id ?? null,
      white_athlete: players[match_idx + r0_matches_count]?._id ?? null,
      winner_athlete: null,
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
    };
    bracket[0][match_idx] = match;
  }

  return bracket;
}
