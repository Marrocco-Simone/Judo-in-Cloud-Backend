import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { Match, Tournament } from '../schemas';
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
      });
    if (!tournament) throw new Error('No tournament found');

    const {
      winners_bracket,
      finished,
      recovered_bracket_1,
      recovered_bracket_2,
    } = tournament;

    if (finished) {
      success(
        res,
        "The tournament's finished, there are no matches left to compete"
      );
    }

    const matches = await getMatches({ winners_bracket, recovered_bracket_1, recovered_bracket_2 });

    success(res, matches);
  } catch (err) {
    error(res, err.message, 500);
  }
};

/* API V2 */
// Reserve a tournament
export const reserve_tournament: RequestHandler = async (req, res) => {
  try {
    const id = req.params.tournament_id;
    if (!mongoose.isValidObjectId(id)) {
      fail(res, 'Tournament id is not valid');
    }
    if (typeof (req.body.tatami_number) === 'undefined') {
      fail(res, 'You must pass a tatami number');
    }
    const update_tournament = await Tournament.findById(id);
    if (update_tournament === null) {
      fail(res, 'Tournament not found', 404);
    }
    update_tournament.tatami_number = req.body.tatami_number;
    const updated_tournament = await update_tournament.save();
    success(res, updated_tournament);
  } catch (err) {
    error(res, err.message);
  }
};

async function getMatches({ winners_bracket, recovered_bracket_1, recovered_bracket_2 }) {
  const matches = [];

  for (let r = 0; r < winners_bracket.length; r++) {
    const round = winners_bracket[r];
    if (!round) continue;

    for (const match_id of round) {
      if (!match_id) continue;
      const match = await Match.findById(match_id);
      if (!match) {
        throw new Error(
          "Found match_id which doesn't reference an existing match"
        );
      }

      matches.push(match);
    }

    if (r === 0) continue;

    const recovered_round_1 = recovered_bracket_1[r-1];
    const recovered_round_2 = recovered_bracket_2[r-1];

    if (recovered_round_1) {
      for (const match_id of recovered_round_1) {
        if (!match_id) continue;
        const match = await Match.findById(match_id);
        if (!match) {
          throw new Error(
            "Found match_id which doesn't reference an existing match"
          );
        }

        matches.push(match);
      }
    }

    if (recovered_round_2) {
      for (const match_id of recovered_round_2) {
        if (!match_id) continue;
        const match = await Match.findById(match_id);
        if (!match) {
          throw new Error(
            "Found match_id which doesn't reference an existing match"
          );
        }

        matches.push(match);
      }
    }
  }

  return matches;
}
