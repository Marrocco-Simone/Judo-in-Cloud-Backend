import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { Tournament } from '../schemas';
import { error, fail, success } from './base_controller';

export const get_tournament: RequestHandler = async (req, res) => {
  const tournament_id = req.params.tournament_id;
  if (!mongoose.isValidObjectId(tournament_id)) {
    return fail(res, 'Id torneo non valido');
  }
  try {
    const tournament = await Tournament.findById(tournament_id)
      .populate({
        path: 'category',
        populate: 'age_class'
      })
      .populate('competition')
      .populate('athletes')
      .populate({
        path: 'winners_bracket',
        model: 'Match',
        populate: ['red_athlete', 'white_athlete', 'winner_athlete']
      })
      .populate({
        path: 'recovered_bracket_1',
        model: 'Match',
        populate: ['red_athlete', 'white_athlete', 'winner_athlete']
      })
      .populate({
        path: 'recovered_bracket_2',
        model: 'Match',
        populate: ['red_athlete', 'white_athlete', 'winner_athlete']
      });
    if (tournament === null) {
      return fail(res, 'Torneo non trovato');
    }

    success(res, tournament);
  } catch (err) {
    console.error({ err });
    error(res, 'Errore nel trovare il torneo');
  }
};
