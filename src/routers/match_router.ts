import express = require('express');
import { Match } from '../schemas/Match';
import { Athlete } from '../schemas/Athlete';
import { AgeClass } from '../schemas/AgeClass';
import { success, error, fail } from '../controllers/base_controller';
import { Types } from 'mongoose';
import { Category } from '../schemas/Category';
/* import { Tournament } from '../schemas/Tournament'; */
/** api for matches */
export const match_router = express.Router();

match_router.get('/:match_id', async (req, res) => {
  try {
    const match_id = req.params.match_id;
    if (!Types.ObjectId.isValid(match_id)) return fail(res, 'Match_id not valid', 400);
    const match = await Match.findById(match_id)
      .populate('white_athlete')
      .populate('red_athlete')
      .populate('winner_athlete');
    if (!match) return fail(res, 'Match not found', 404);
    /* final way should use the tournament id */
    /* const tournament = await Tournament.findById(match.tournament);
    const category = await Category.findById(tournament.category); */
    const athlete = await Athlete.findById(match.white_athlete._id);
    const category = await Category.findById(athlete.category);
    const age_class = await AgeClass.findById(category.age_class);
    const match_data = {
      ...match.toObject(),
      params: age_class.params,
      category_name: `${age_class.name} U${category.max_weight} ${category.gender}`,
    };
    success(res, match_data);
  } catch (e) {
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
    if (body.is_started) match.is_started = body.is_started;
    if (body.is_over) match.is_over = body.is_over;
    if (body.match_scores) match.match_scores = body.match_scores;
    if (body.winner_athlete && Athlete.exists({ _id: body.winner_athlete })) {
      match.winner_athlete = new Types.ObjectId(body.winner_athlete);
      // Girardi
    }
    await match.save();
    success(res, match);
  } catch (e) {
    error(res, e.message);
  }
});
