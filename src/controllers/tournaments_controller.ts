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

// Get next match for tournament by id
export const get_next_matches: RequestHandler = async (req, res) => {
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

    const winners_bracket_next = await getNextMatches({
      bracket: winners_bracket,
    });
    const recovered_bracket_next_1 = await getNextMatches({
      bracket: recovered_bracket_1,
    });
    const recovered_bracket_next_2 = await getNextMatches({
      bracket: recovered_bracket_2,
    });

    success(res, {
      winners_bracket_next,
      recovered_bracket_next_1,
      recovered_bracket_next_2,
    });
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

async function getNextMatches({ bracket }) {
  const bracket_next = [];

  for (const round of bracket) {
    if (!round) continue;
    for (const match_id of round) {
      if (!match_id) continue;
      // TODO: load all matches upfront to avoid N + 1 problem
      const match = await Match.findById(match_id);
      if (!match) {
        throw new Error(
          "Found match_id which doesn't reference an existing match"
        );
      }

      if (!match.is_started) bracket_next.push(match);
    }
  }

  return bracket_next;
}
