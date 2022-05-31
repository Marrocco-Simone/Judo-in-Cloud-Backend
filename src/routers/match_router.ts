import express = require('express');
import { Match, MatchInterface } from '../schemas/Match';
import { Athlete } from '../schemas/Athlete';
import { AgeClass } from '../schemas/AgeClass';
import { success, error, fail } from '../controllers/base_controller';
import { Document, Types } from 'mongoose';
import { Category } from '../schemas/Category';
import { Tournament } from '../schemas/Tournament';
import { calculateVictory } from '../helpers/bracket_utils';
/* import { Tournament } from '../schemas/Tournament'; */
/** api for matches */
export const match_router = express.Router();

match_router.get('/:match_id', async (req, res) => {
  try {
    const match_id = req.params.match_id;
    if (!Types.ObjectId.isValid(match_id)) return fail(res, 'Incontro non trovato', 400);
    const match = await Match.findById(match_id)
      .populate('white_athlete')
      .populate('red_athlete')
      .populate('winner_athlete');
    if (!match) return fail(res, 'Incontro non trovato', 404);
    /* final way should use the tournament id */
    /* const tournament = await Tournament.findById(match.tournament);
    const category = await Category.findById(tournament.category); */
    const tournament = await Tournament.findById(match.tournament)
      .populate({
        path: 'category',
        populate: {
          path: 'age_class'
        }
      });
    const category = await Category.findById(tournament.category);
    const age_class = await AgeClass.findById(category.age_class);
    const match_data = {
      ...match.toObject(),
      // TODO should this api return the age class params and the category_name?
      params: age_class.params,
      category_name: `${age_class.name} U${category.max_weight} ${category.gender}`,
    };
    success(res, match_data);
  } catch (e) {
    console.error({ e });
    error(res, e.message);
  }
});

match_router.post('/:match_id', async (req, res) => {
  try {
    const match_id = req.params.match_id;
    const match = await Match.findById(match_id);
    const tournament = await Tournament.findById(match.tournament)
      .populate({
        path: 'winners_bracket',
        model: 'Match'
      });
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
      await match.save();
      // update the bracket
      // find the match within the winners bracket
      const bracket = tournament.winners_bracket as (MatchInterface & Document)[][];
      const pos_info = findMatch(bracket, match);
      if (pos_info === null) {
        return error(res, 'Incontro non trovato nella bracket');
      }
      const [round_idx, idx] = pos_info;
      bracket[round_idx][idx] = match;
      // WIP
      // tournament.winners_bracket = (await calculateVictory(bracket, round_idx, idx)).map(round => {
      //   return round.map(match => {
      //     return match?._id ?? null;
      //   });
      // });
      // await tournament.save();
    }
    await match.save();
    success(res, match);
  } catch (e) {
    console.error({ e });
    error(res, e.message);
  }
});

function findMatch(bracket: MatchInterface[][], match: MatchInterface): [number, number] | null {
  for (let round_idx = 0; round_idx < bracket.length; round_idx++) {
    const round = bracket[round_idx];
    for (let idx = 0; idx < round.length; idx++) {
      const other_match = round[idx];
      if (other_match && match._id.equals(other_match._id)) {
        return [round_idx, idx];
      }
    }
  }

  return null;
}
