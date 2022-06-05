import { RequestHandler } from 'express';
import { Match, MatchInterface } from '../schemas/Match';
import { AgeClass } from '../schemas/AgeClass';
import { success, error, fail } from '../controllers/base_controller';
import { Document, Types } from 'mongoose';
import { Category } from '../schemas/Category';
import { Tournament, TournamentInterface } from '../schemas/Tournament';
import { BracketsT, calculateMainVictory, calculateVictory, storeJicBrackets, toJicBracket, toUtilsBracket } from '../helpers/bracket_utils';

export const get_match: RequestHandler = async (req, res) => {
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
};

export const update_match: RequestHandler = async (req, res) => {
  try {
    const match_id = req.params.match_id;
    const match = await Match.findById(match_id);
    if (!match) return fail(res, 'Match not found', 404);
    const tournament = await Tournament.findById(match.tournament)
      .populate({
        path: 'winners_bracket',
        model: 'Match'
      })
      .populate({
        path: 'recovered_bracket_1',
        model: 'Match'
      })
      .populate({
        path: 'recovered_bracket_2',
        model: 'Match'
      });
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
    if (body.winner_athlete) {
      let winner_idx: number;
      if (match.white_athlete.equals(body.winner_athlete)) {
        winner_idx = 0;
      } else if (match.red_athlete.equals(body.winner_athlete)) {
        winner_idx = 1;
      } else {
        return fail(res, 'Atleta vincitore non trovato');
      }
      if (match.tournament) {
        const updated_brackets = getUpdatedBrackets(tournament, match, winner_idx);
        if (updated_brackets === null) {
          return error(res, 'Incontro non trovato nella bracket');
        }
        await storeJicBrackets(
          tournament,
          toJicBracket(updated_brackets.main, tournament, tournament.winners_bracket as (MatchInterface & Document)[][]),
          toJicBracket(updated_brackets.recovery[0], tournament, tournament.recovered_bracket_1 as (MatchInterface & Document)[][]),
          toJicBracket(updated_brackets.recovery[1], tournament, tournament.recovered_bracket_2 as (MatchInterface & Document)[][]),
        );
      } else {
        match.winner_athlete = new Types.ObjectId(body.winner_athlete);
        await match.save();
      }
    }
    await match.save();
    success(res, match);
  } catch (e) {
    console.error({ e });
    error(res, e.message);
  }
};

function getUpdatedBrackets (tournament: TournamentInterface, match: MatchInterface, winner_idx: number): BracketsT {
  const utils_brackets: BracketsT = {
    main: toUtilsBracket(tournament.winners_bracket as MatchInterface[][]),
    recovery: [
      toUtilsBracket(tournament.recovered_bracket_1 as MatchInterface[][]),
      toUtilsBracket(tournament.recovered_bracket_2 as MatchInterface[][])
    ]
  };
  const pos_info = findMatch(tournament.winners_bracket as MatchInterface[][], match);
  if (pos_info !== null) {
    const [round_idx, idx] = pos_info;
    return calculateMainVictory(
      utils_brackets,
      round_idx,
      idx,
      winner_idx
    );
  }
  const recovery = [
    tournament.recovered_bracket_1,
    tournament.recovered_bracket_2
  ];
  for (let i = 0; i < 2; i++) {
    const pos_info = findMatch(recovery[i] as MatchInterface[][], match);
    if (pos_info !== null) {
      const [round_idx, idx] = pos_info;
      utils_brackets.recovery[i] = calculateVictory(
        utils_brackets.recovery[i],
        round_idx,
        idx,
        winner_idx
      );
      return {
        main: utils_brackets.main,
        recovery: utils_brackets.recovery
      };
    }
  }
  return null;
}

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
