import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { Match, Tournament } from '../schemas';
import { MatchInterface } from '../schemas/Match';
import { error, fail, success } from './base_controller';

export const get_tournament: RequestHandler = async (req, res) => {
  const tournament_id = req.params.tournament_id;
  if (!mongoose.isValidObjectId(tournament_id)) {
    return fail(res, 'Id torneo non valido');
  }
  try {
    const tournament = await Tournament.findById(tournament_id)
      .populate({
        path: 'category',
        populate: 'age_class'
      })
      .populate('competition')
      .populate('athletes')
      .populate({
        path: 'winners_bracket',
        model: 'Match',
        populate: ['red_athlete', 'white_athlete', 'winner_athlete']
      })
      .populate({
        path: 'recovered_bracket_1',
        model: 'Match',
        populate: ['red_athlete', 'white_athlete', 'winner_athlete']
      })
      .populate({
        path: 'recovered_bracket_2',
        model: 'Match',
        populate: ['red_athlete', 'white_athlete', 'winner_athlete']
      });
    if (tournament === null) {
      return fail(res, 'Torneo non trovato');
    }

    success(res, tournament);
  } catch (err) {
    console.error({ err });
    error(res, 'Errore nel trovare il torneo');
  }
};

// Getting all
export const get_tournaments: RequestHandler = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate({
      path: 'category',
      model: 'Category',
      populate: [
        {
          path: 'age_class',
          model: 'AgeClass',
        },
      ],
    });
    success(res, tournaments);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Get all matches for tournament by id
export const get_tournament_matches: RequestHandler = async (req, res) => {
  try {
    const tournament_id = req.params.tournament_id;
    const tournament = await Tournament.findById(tournament_id)
      .populate('category')
      .populate('competition')
      .populate('athletes')
      .populate({
        path: 'winners_bracket',
        model: 'Match',
      })
      .populate({
        path: 'recovered_bracket_1',
        model: 'Match',
      })
      .populate({
        path: 'recovered_bracket_2',
        model: 'Match',
      });
    if (!tournament) throw new Error('No tournament found');

    const {
      winners_bracket,
      finished,
      recovered_bracket_1,
      recovered_bracket_2,
    } = tournament;

    if (finished) {
      return success(res, 'The tournament\'s finished, there are no matches left to compete');
    }

    const matches = await getMatches({ winners_bracket, recovered_bracket_1, recovered_bracket_2 });

    success(res, matches);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

/* API V2 */
// Reserve a tournament
export const reserve_tournament: RequestHandler = async (req, res) => {
  const user = req.user;
  const competition = user.competition;
  const id = req.params.tournament_id;

  if (!mongoose.isValidObjectId(id)) {
    return fail(res, 'Tournament id is not valid');
  }
  if (req.body.tatami_number === undefined) {
    return fail(res, 'Devi indicare un numero tatami');
  }
  const tatami_number = parseInt(req.body.tatami_number, 10);
  if (isNaN(tatami_number) || tatami_number < 1) {
    return fail(res, 'Numero tatami non valido');
  }

  try {
    const update_tournament = await Tournament.findById(id);
    if (update_tournament === null) {
      return fail(res, 'Tournament not found', 404);
    }
    if (!update_tournament.competition.equals(competition._id)) {
      return fail(res, 'Non puoi eseguire questa operazione', 403);
    }
    update_tournament.tatami_number = req.body.tatami_number;
    const updated_tournament = await update_tournament.save();
    success(res, updated_tournament);
  } catch (err) {
    error(res, err.message);
  }
};

// Get leaderboard for a specific tournament
export const get_tournament_leaderboard: RequestHandler = async (req, res) => {
  try {
    const tournament_id = req.params.tournament_id;
    const tournament = await Tournament.findById(tournament_id)
      .populate('category')
      .populate('competition')
      .populate('athletes')
      .populate({
        path: 'winners_bracket',
        model: 'Match',
      })
      .populate({
        path: 'recovered_bracket_1',
        model: 'Match',
      })
      .populate({
        path: 'recovered_bracket_2',
        model: 'Match',
      });
    if (!tournament) throw new Error('No tournament found');

    const {
      winners_bracket,
      finished,
      recovered_bracket_1,
      recovered_bracket_2,
    } = tournament;

    if (!finished) {
      return fail(res, 'Il torneo non è ancora finito, impossibile generare la classifica');
    }

    const final_match = winners_bracket[winners_bracket.length - 1][0] as MatchInterface;
    const { winner_athlete: first_place, loser_athlete: second_place } = getMatchWinner({ match: final_match });

    let third_place_1;
    let third_place_2;
    let fifth_place_1;
    let fifth_place_2;

    if (recovered_bracket_1.length > 0) {
      const recovered_final_1 = recovered_bracket_1[recovered_bracket_1.length - 1][0] as MatchInterface;
      ({ winner_athlete: third_place_1, loser_athlete: fifth_place_1 } = getMatchWinner({ match: recovered_final_1 }));
    }

    if (recovered_bracket_2.length > 0) {
      const recovered_final_2 = recovered_bracket_2[recovered_bracket_2.length - 1][0] as MatchInterface;
      ({ winner_athlete: third_place_2, loser_athlete: fifth_place_2 } = getMatchWinner({ match: recovered_final_2 }));
    }

    const final_leaderboard = [
      { place: 1, athlete: first_place },
      { place: 2, athlete: second_place },
      { place: 3, athlete: third_place_1 },
      { place: 3, athlete: third_place_2 },
      { place: 5, athlete: fifth_place_1 },
      { place: 5, athlete: fifth_place_2 }
    ].filter(r => r.athlete);

    return success(res, final_leaderboard);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

async function getMatches({ winners_bracket, recovered_bracket_1, recovered_bracket_2 }) {
  const matches = [];

  for (let r = 0; r < winners_bracket.length - 1; r++) {
    const winners_round = winners_bracket[r];
    if (!winners_round) continue;

    const winners_round_matches = await getMatchesFromRound({ round: winners_round });
    matches.push(...winners_round_matches);

    if (r === 0) continue;

    const recovered_round_1 = recovered_bracket_1[r - 1];
    const recovered_round_2 = recovered_bracket_2[r - 1];

    if (recovered_round_1) {
      const recovered_round_1_matches = await getMatchesFromRound({ round: recovered_round_1 });
      matches.push(...recovered_round_1_matches);
    }

    if (recovered_round_2) {
      const recovered_round_2_matches = await getMatchesFromRound({ round: recovered_round_2 });
      matches.push(...recovered_round_2_matches);
    }
  }

  const final_index = winners_bracket.length - 1;

  const recovered_round_1 = recovered_bracket_1[final_index - 1];
  const recovered_round_2 = recovered_bracket_2[final_index - 1];
  const winners_round = winners_bracket[final_index];

  if (recovered_round_1) {
    const recovered_round_1_matches = await getMatchesFromRound({ round: recovered_round_1 });
    matches.push(...recovered_round_1_matches);
  }

  if (recovered_round_2) {
    const recovered_round_2_matches = await getMatchesFromRound({ round: recovered_round_2 });
    matches.push(...recovered_round_2_matches);
  }

  if (winners_round) {
    const winners_round_matches = await getMatchesFromRound({ round: winners_round });
    matches.push(...winners_round_matches);
  }

  return matches;
}

async function getMatchesFromRound({ round }) {
  const round_matches = [];

  for (const match_id of round) {
    if (!match_id) continue;
    const match = await Match.findById(match_id);
    if (!match) {
      throw new Error(
        "Found match_id which doesn't reference an existing match"
      );
    }

    round_matches.push(match);
  }

  return round_matches;
}

function getMatchWinner ({ match }) {
  const { winner_athlete, white_athlete, red_athlete } = match;
  const loser_athlete = winner_athlete.toString() === white_athlete.toString() ? red_athlete : white_athlete;

  return { winner_athlete, loser_athlete };
}
