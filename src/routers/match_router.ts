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
