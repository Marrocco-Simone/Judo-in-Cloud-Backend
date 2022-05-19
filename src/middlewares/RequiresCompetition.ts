import express = require('express');
import { error, fail } from '../controllers/base_controller';

export const requires_competition: express.RequestHandler = (req, res, next) => {
  if (!req.user) {
    console.error('[MIDDLEWARE ERROR] requires_competition called but user not populated, please check the order of middlewares');
    return error(res, 'Errore interno');
  }
  if (!req.user.competition) {
    return fail(res, 'Per usare questa funzionalità devi essere parte di una competizione');
  }
  next();
};
