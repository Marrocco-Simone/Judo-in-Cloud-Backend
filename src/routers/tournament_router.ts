import express = require('express');
import { error, success } from '../controllers/base_controller';
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
      });
    if (!tournament) throw new Error('No tournament found');

    success(res, tournament);
  } catch (err) {
    error(res, err.message, 500);
  }
});

// Get all matches for tournament by id
tournament_router.get('/:tournament_id/matches', async (req, res) => {
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
});

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
