import { RequestHandler } from 'express';
import mongoose, { Types } from 'mongoose';
import { Competition, Match, Tournament } from '../schemas';
import { error, fail, success } from './base_controller';

/**
 * find a competition by the slug
 */
export const find_competition: RequestHandler = async (req, res) => {
  const slug = req.params.slug;
  if (slug === undefined) {
    return fail(res, 'Nessun torneo specificato');
  }

  try {
    const competition = await Competition.findOne({ slug });
    if (competition === null) {
      return fail(res, 'Competizione non trovata', 404);
    }
    success(res, competition);
  } catch (err) {
    console.error({ err });
    error(res, 'Errore nel trovare la competizione');
  }
};

/**
 * get the tournaments for a competition
 */
export const get_competition_tournaments: RequestHandler = async (req, res) => {
  const competition_id = req.params.competition_id;
  if (!mongoose.isValidObjectId(competition_id)) {
    return fail(res, 'Id competizione non valido');
  }

  try {
    const competition = await Competition.findById(competition_id);
    if (competition === null) {
      return fail(res, 'Competizione non trovata', 404);
    }
    const tournaments = await Tournament.find({ competition: competition_id })
      .populate({
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
    console.error({ err });
    error(res, 'Errore nel trovare i tornei');
  }
};
