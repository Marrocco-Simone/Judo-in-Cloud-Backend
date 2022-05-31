// export {}; //needed or typescripts gives some strange errors
import { Category } from '../schemas/Category';
import { error, fail, success } from '../controllers/base_controller';
import { Athlete } from '../schemas/Athlete';
import { Types } from 'mongoose';
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

// Getting all clubs
/* API V2 */
athlete_router.get('/club', async (req, res) => {
  const clubs = new Set();
  try {
    const athletes = await Athlete.find();
    for (const athlete of athletes) {
      clubs.add(athlete.club);
    }
    const clubs_array = Array.from(clubs);
    success(res, clubs_array, 200);
  } catch (err) {
    fail(res, 'Internal error', 500);
  }
});

// Creating One
athlete_router.post('/', async (req, res) => {
  const body: {
    name: string;
    surname: string;
    user: { competition: { _id: string } };
    club: string;
    gender: 'M' | 'F';
    weight: number;
    birth_year: number;
  } = req.body;

  if (
    !body.name ||
    !body.surname ||
    !body.club ||
    !body.gender ||
    !body.weight ||
    !body.birth_year
  ) {
    fail(res, 'Campi Incompleti');
  }

  if (body.gender !== 'M' && body.gender !== 'F') {
    fail(res, 'Campo gender deve essere M o F');
  }

  try {
    const athlete = new Athlete({
      name: body.name,
      surname: body.surname,
      club: body.club,
      competition: req.user.competition._id,
      gender: body.gender,
      weight: body.weight,
      birth_year: body.birth_year,
      category: await computeCategory(
        body.birth_year,
        body.weight,
        body.gender
      ),
    });
    const new_athlete = await athlete.save();
    success(res, new_athlete);
  } catch (err) {
    error(res, err.message, 500);
  }
});

// Modify an athlete
/* API V2 */
athlete_router.put('/:athlete_id', async (req, res) => {
  try {
    const id = new Types.ObjectId(req.params.athlete_id);
    const athlete = await Athlete.findById(id);
    if (!athlete) return fail(res, 'Athlete not found', 404);

    const body: {
      name?: string;
      surname?: string;
      user?: { competition: { _id: string } };
      club?: string;
      gender?: 'M' | 'F';
      weight?: number;
      birth_year?: number;
    } = req.body;

    if (body.name) athlete.name = body.name;
    if (body.surname) athlete.surname = body.surname;
    if (body.club) athlete.club = body.club;
    if (body.gender) athlete.gender = body.gender;
    if (body.weight) athlete.weight = body.weight;
    if (body.birth_year) athlete.birth_year = body.birth_year;
    if (body.gender || body.weight || body.birth_year) {
      athlete.category = await computeCategory(
        body.birth_year,
        body.weight,
        body.gender
      );
    }
    await athlete.save();
    success(res, athlete, 200);
  } catch (err) {
    error(res, err.message, 500);
  }
});

// Delete an athlete
/* API V2 */
athlete_router.delete('/:athlete_id', async (req, res) => {
  try {
    const id = new Types.ObjectId(req.params.athlete_id);
    const athlete = await Athlete.findById(id);
    if (!athlete) return fail(res, 'Athlete not found', 404);

    await athlete.remove();
    success(res, athlete, 200);
  } catch (error) {
    fail(res, error.message, 500);
  }
});

/* TODO aggiungere classe pesi massimi, tipo 100+ */
async function computeCategory(
  birth_year: number,
  weight: number,
  gender: 'M' | 'F'
) {
  const d = new Date();
  const current_year: number = d.getFullYear();
  const athlete_age = current_year - birth_year;
  const category = await Category.find({
    gender,
    max_weight: { $gt: weight },
  }).populate('age_class');
  let best_category = category[0];
  for (const cat of category) {
    // @ts-ignore
    if (cat.age_class.max_age < athlete_age) continue;
    // @ts-ignore
    if (cat.age_class.max_age > best_category.age_class.max_age) continue;
    if (cat.max_weight < weight) continue;
    if (cat.max_weight > best_category.max_weight) continue;
    best_category = cat;
  }
  return best_category._id;
}
