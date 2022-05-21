// export {}; //needed or typescripts gives some strange errors
import { Category } from '../schemas/Category';
import { error, fail, success } from '../controllers/base_controller';
import { Athlete } from '../schemas/Athlete';
const express = require('express');

/** apis for athletes */
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

  if (
    !body.name ||
    !body.surname ||
    !body.club ||
    !body.gender ||
    !body.weight ||
    !body.birth_year
  ) fail(res, 'Campi Incompleti');

  if (body.gender !== 'M' && body.gender !== 'F') fail(res, 'Campo gender deve essere M o F');

  const athlete = new Athlete({
    name: body.name,
    surname: body.surname,
    club: body.club,
    competition: body.competition,
    gender: body.gender,
    weight: body.weight,
    birth_year: body.birth_year,
    category: computeCategory(body.birth_year, body.weight, body.gender)
  });
  try {
    const new_athlete = await athlete.save();
    success(res, new_athlete);
  } catch (err) {
    error(res, err.message, 400);
  }
});
async function computeCategory(birth_year: number, weight: number, gender: 'M'|'F') {
  const d = new Date();
  const current_year:number = d.getFullYear();
  const athlete_age = current_year - birth_year;
  const category = await Category.find({ gender, max_weight: { $gt: weight } }).populate('age_class');
  let best_category = category[0];
  for (const cat of category) {
    if (cat.age_class.max_age < athlete_age) continue;
    if (cat.age_class.max_age > best_category.age_class.max_age) continue;
    if (cat.max_weight < weight) continue;
    if (cat.max_weight > best_category.max_weight) continue;
    best_category = cat;
  }
  return best_category._id;
}

