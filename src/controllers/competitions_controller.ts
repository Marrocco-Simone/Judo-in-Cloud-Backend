import { RequestHandler } from 'express';
import { Competition } from '../schemas';
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
    error(res, 'Errore nel trovare la competizione', 500);
  }
};
