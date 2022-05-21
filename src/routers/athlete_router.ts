// export {}; //needed or typescripts gives some strange errors
import { Category } from '../schemas/Category';
import { error, success } from '../controllers/base_controller';
import { Athlete } from '../schemas/Athlete';
import { Types } from 'mongoose';
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
    birth_year: number,
    category: Types.ObjectId;
  } = req.body;

  const athlete_category = computeCategory(req);

  const athlete = new Athlete({
    name: body.name,
    surname: body.surname,
    club: body.club,
    competition: body.competition,
    gender: body.gender,
    weight: body.weight,
    birth_year: body.birth_year,
    category: athlete_category
  });
  try {
    const new_athlete = await athlete.save();
    success(res, new_athlete);
  } catch (err) {
    error(res, err.message, 400);
  }
});
function computeCategory(req) {
  const d = new Date();
  const current_year:number = d.getFullYear();

  return Category.findOne({ gender: req.body.gender, age: { $gt: (current_year-req.body.birth_year) }});
}

  
