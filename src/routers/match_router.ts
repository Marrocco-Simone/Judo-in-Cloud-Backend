import express = require('express');
import { Match } from '../schemas/Match';
import { success, error, fail } from '../controllers/base_controller';
/* ELIMINA */ import { Athlete } from '../schemas/Athlete';
/** api for matches */
export const match_router = express.Router();

/* ELIMINA */ match_router.get('/inizialize', async (req, res) => {
  try {
    const athletes = await Athlete.insertMany([
      {
        name: 'Mario',
        surname: 'Rossi',
        club: 'Judo Kodokan Lavis',
        gender: 'M',
        weight: 66,
        birth_year: 2000,
      },
      {
        name: 'Giuseppe Giovanni',
        surname: 'Esposito',
        club: 'Judo e Movi-Mente Le Sorgive',
        gender: 'M',
        weight: 66,
        birth_year: 2000,
      },
    ]);
    const red_athlete = athletes[0]._id;
    const white_athlete = athletes[1]._id;
    const matches = await Match.insertMany([
      {
        white_athlete,
        red_athlete,
        winner_athlete: null,
        is_started: false,
        is_over: false,
        match_scores: null,
      },
    ]);
    success(res, matches[0]._id);
  } catch (e) {
    error(res, e.message);
  }
});

match_router.get('/:matchid', async (req, res) => {
  try {
    const match_id = req.params.matchid;
    const match = await Match.findById(match_id)
      .populate('white_athlete')
      .populate('red_athlete')
      .populate('winner_athlete');
    if (match == null) return fail(res, 'Match not found', 404);
    success(res, match);
  } catch (e) {
    error(res, e.message);
  }
});
