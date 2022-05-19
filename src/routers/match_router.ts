import express = require('express');
import { Match } from '../schemas/Match';
/* TODO Elimina */ import { Category } from '../schemas/Category';
import { Athlete } from '../schemas/Athlete';
import { success, error, fail } from '../controllers/base_controller';
import { Types } from 'mongoose';
/** api for matches */
export const match_router = express.Router();

/* TODO Elimina */ match_router.get('/create_matches', async (req, res) => {
  const category = await Category.findOne();
  const athletes = await Athlete.find({ category: category._id }).populate('category');
  
  success(res, athletes);
});

match_router.get('/:match_id', async (req, res) => {
  try {
    const match_id = req.params.match_id;
    const match = await Match.findById(match_id)
      .populate('white_athlete')
      .populate('red_athlete')
      .populate('winner_athlete');
    if (!match) return fail(res, 'Match not found', 404);
    success(res, match);
  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
});

match_router.post('/:match_id', async (req, res) => {
  try {
    const match_id = req.params.match_id;
    const match = await Match.findById(match_id);
    if (!match) return fail(res, 'Match not found', 404);
    const body: {
      winner_athlete: string;
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
    if (body.winner_athlete && Athlete.exists({ _id: body.winner_athlete })) {
      match.winner_athlete = new Types.ObjectId(body.winner_athlete);
    }
    if (body.is_started) match.is_started = body.is_started;
    if (body.is_over) match.is_over = body.is_over;
    if (body.match_scores) match.match_scores = body.match_scores;
    await match.save();
    success(res, match);
  } catch (e) {
    error(res, e.message);
  }
});
