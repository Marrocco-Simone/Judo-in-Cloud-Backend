import express = require('express');
import { error, success } from '../controllers/base_controller';
import { Tournament } from '../schemas/Tournament';
/** api for tournaments */
export const tournament_router = express.Router();

// Getting all
tournament_router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    success(res, tournaments);
  } catch (err) {
    error(res, err.message, 500);
  }
});
