import express from 'express';
import { isValidObjectId } from 'mongoose';
import { error, fail, success } from '../controllers/base_controller';
import { Match } from '../schemas';
import { Tournament } from '../schemas/Tournament';

/** api for tournaments */
export const tournament_router = express.Router();

// Getting all
tournament_router.get('/', async (req, res) => {
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
});

// Get tournament by id
tournament_router.get('/:tournament_id', async (req, res) => {
  try {
    const tournament_id = req.params.tournament_id;
    const tournament = await Tournament.findById(tournament_id)
      .populate('category')
      .populate('competition')
      .populate('athletes')
      .populate({
        path: 'winners_bracket',
        model: 'Match',
        populate: [{
          path: 'red_athlete',
          model: 'Athlete'
        }, {
          path: 'white_athlete',
          model: 'Athlete'
        }, {
          path: 'winner_athlete',
          model: 'Athlete'
        }]
      })
      .populate({
        path: 'recovered_bracket_1',
        model: 'Match',
        populate: [{
          path: 'red_athlete',
          model: 'Athlete'
        }, {
          path: 'white_athlete',
          model: 'Athlete'
        }, {
          path: 'winner_athlete',
          model: 'Athlete'
        }]
      })
      .populate({
        path: 'recovered_bracket_2',
        model: 'Match',
        populate: [{
          path: 'red_athlete',
          model: 'Athlete'
        }, {
          path: 'white_athlete',
          model: 'Athlete'
        }, {
          path: 'winner_athlete',
          model: 'Athlete'
        }]
      });
    if (!tournament) throw new Error('No tournament found');

    success(res, tournament);
  } catch (err) {
    error(res, err.message, 500);
  }
});

// Get next match for tournament by id
tournament_router.get('/:tournament_id/next', async (req, res) => {
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
});

/* API V2 */
// Reserve a tournament
tournament_router.post('/reserve/:tournament_id', async (req, res) => {
  try {
    const id = req.params.tournament_id;
    if (!isValidObjectId(id)) {
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
});

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
