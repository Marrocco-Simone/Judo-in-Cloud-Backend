import express = require('express');
import { Tournament } from '../schemas/Tournament';
/** api for tournaments */
export const tournament_router = express.Router();

// Getting all
tournament_router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
