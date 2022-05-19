import express = require('express');
import { Match } from '../schemas/Match';
import { success, error, fail } from '../controllers/base_controller';
/** api for matches */
export const match_router = express.Router();

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
