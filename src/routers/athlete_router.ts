// export {}; //needed or typescripts gives some strange errors
import { error, success } from '../controllers/base_controller';
import { Athlete } from '../schemas/Athlete';
const express = require('express');

// /** apis for athletes */
// export const athlete_router = express.Router();

// athlete_router.get('/test', async (req,res) => {
//    res.json({success: 1});
// });

export const athlete_router = express.Router();

// Getting all
athlete_router.get('/', async (req, res) => {
  try {
    const athletes = await Athlete.find();
    success(res, athletes);
  } catch (err) {
    error(res, err.message, 500);
  }
});

// Creating One
athlete_router.post('/', async (req, res) => {
  const body: {
    name: string,
    surname: string,
    competition: string,
    club: string,
    gender: 'M'|'F',
    weight: number,
    birth_year: number
  } = req.body;

  const athlete = new Athlete({
    name: body.name,
    surname: body.surname,
    club: body.club,
    competition: body.competition,
    gender: body.gender,
    weight: body.weight,
    birth_year: body.birth_year
  });
  try {
    const new_athlete = await athlete.save();
    success(res, new_athlete);
  } catch (err) {
    error(res, err.message, 400);
  }
});
