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

match_router.post('/:matchid', async (req, res) => {
  try {
    const match_id = req.params.matchid;
    const match = await Match.findById(match_id);
    if (match == null) return fail(res, 'Match not found', 404);
    const body: {
      winner_athlete: string,
      is_started: boolean;
      is_over: boolean;
      match_scores: {
        final_time: number;
        white_ippon: number;
        white_wazaari: number;
        white_penalties: number;
        red_ippon: number;
        red_wazaari: number;
        red_penalties: number;
      };
    } = req.body;
    if (body.winner_athlete) match.winner_athlete = body.winner_athlete;
    if (body.is_started) match.is_started = body.is_started;
    if (body.is_over) match.is_over = body.is_over;
    if (body.match_scores) match.match_scores = body.match_scores;
    await match.save();
    success(res, match);
  } catch (e) {
    error(res, e.message);
  }
});

// Getting all
match_router.get('/:matchid', async (req, res) => {
    try{
        const match = await Match.find();
        res.json(match);
    }catch (err){
        res.status(500).json({ message: err.message })
    }
})
