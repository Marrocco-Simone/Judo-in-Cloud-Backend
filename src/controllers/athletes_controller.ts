import { Category } from '../schemas/Category';
import { error, fail, success } from '../controllers/base_controller';
import { Athlete, AthleteInterface } from '../schemas/Athlete';
import mongoose, { Types } from 'mongoose';
import { AgeClass, Tournament } from '../schemas';
import { RequestHandler } from 'express';

// Getting all
export const get_athletes: RequestHandler = async (req, res) => {
  try {
    const me = req.user;
    const competition = me.competition;
    const athletes = await Athlete.find({ competition: competition._id });
    success(res, athletes);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Getting all clubs
/* API V2 */
export const get_clubs: RequestHandler = async (req, res) => {
  const clubs = new Set();
  try {
    const athletes = await Athlete.find();
    for (const athlete of athletes) {
      clubs.add(athlete.club);
    }
    const clubs_array = Array.from(clubs);
    success(res, clubs_array, 200);
  } catch (err) {
    fail(res, 'Errore interno al sistema', 500);
  }
};

// Getting athetes of club + tournament_id
/* API V2 */
export const get_athletes_by_club = async (req, res) => {
  const club = req.params.club;
  try {
    const athletes = await Athlete.find({ club }).populate({
      path: 'category',
      model: 'Category',
      populate: [
        {
          path: 'age_class',
          model: 'AgeClass',
        },
      ],
    });

    if (!athletes.length) return fail(res, 'Club non trovato', 404);

    const tournaments = await Tournament.find();

    const category_to_tournament: { [category_id: string]: Types.ObjectId } =
      {};
    for (const tour of tournaments) {
      category_to_tournament[`${tour.category}`] = tour._id;
    }

    const athletes_send: (AthleteInterface & { tournament: Types.ObjectId })[] =
      athletes.map((athlete) => {
        return {
          _id: athlete._id,
          name: athlete.name,
          surname: athlete.surname,
          club: athlete.club,
          birth_year: athlete.birth_year,
          weight: athlete.weight,
          gender: athlete.gender,
          competition: athlete.competition,
          category: athlete.category,
          tournament: category_to_tournament[`${athlete.category._id}`],
        };
      });

    success(res, athletes_send, 200);
  } catch (err) {
    fail(res, 'Internal error', 500);
  }
};

// Creating One
export const create_athlete: RequestHandler = async (req, res) => {
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
    return fail(res, 'Campi Incompleti');
  }

  if (body.gender !== 'M' && body.gender !== 'F') {
    return fail(res, 'Campo gender deve essere M o F');
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
        body.gender,
        req.user.competition._id
      ),
    });

    if (!athlete.category) return fail(res, 'Non esiste una categoria adatta all\'atleta');

    const new_athlete_category = await Category.findById(athlete.category);
    const new_athlete_ageclass = await AgeClass.findById(new_athlete_category.age_class);
    if (new_athlete_ageclass.closed) {
      return fail(res, 'L\'atleta non può essere eliminato, dato che la classe d\'età è chiusa');
    }

    const new_athlete = await athlete.save();
    success(res, new_athlete);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Modify an athlete
/* API V2 */
export const update_athlete: RequestHandler = async (req, res) => {
  try {
    const me = req.user;
    const competition = me.competition;
    if (!mongoose.isValidObjectId(req.params.athlete_id)) {
      return fail(res, 'Id dell\'atleta non valido');
    }
    const id = new mongoose.Types.ObjectId(req.params.athlete_id);
    const athlete = await Athlete.findById(id);
    if (!athlete) return fail(res, 'Atleta non trovato', 404);

    const body: {
      name?: string;
      surname?: string;
      user?: { competition: { _id: string } };
      club?: string;
      gender?: 'M' | 'F';
      weight?: number;
      birth_year?: number;
    } = req.body;

    if (!athlete.competition.equals(competition._id)) {
      return fail(res, 'Non sei autorizzato', 403);
    }

    if (
      (typeof (body.birth_year) !== 'undefined' && typeof (body.birth_year) !== 'number') ||
      (typeof (body.weight) !== 'undefined' && typeof (body.weight) !== 'number') ||
      (typeof (body.gender) !== 'undefined' && body.gender !== 'M' && body.gender !== 'F')
    ) {
      return fail(res, 'Anno di nascita, peso e sesso devono essere dei valori validi');
    }

    if (body.name) athlete.name = body.name;
    if (body.surname) athlete.surname = body.surname;
    if (body.club) athlete.club = body.club;
    if (body.gender) athlete.gender = body.gender;
    if (body.weight) athlete.weight = body.weight;
    if (body.birth_year) athlete.birth_year = body.birth_year;
    if (body.gender || body.weight || body.birth_year) {
      athlete.category = await computeCategory(
        athlete.birth_year,
        athlete.weight,
        athlete.gender,
        req.user.competition._id,
      );
    }

    if (!athlete.category) return fail(res, 'Non esiste una categoria adatta all\'atleta');

    const new_athlete_category = await Category.findById(athlete.category);
    const new_athlete_ageclass = await AgeClass.findById(new_athlete_category.age_class);
    if (new_athlete_ageclass.closed) {
      return fail(res, 'L\'atleta non può essere eliminato, dato che la classe d\'età è chiusa');
    }

    await athlete.save();
    success(res, athlete, 200);
  } catch (err) {
    console.error({ err });
    error(res, err.message, 500);
  }
};

// Delete an athlete
/* API V2 */
export const delete_athlete: RequestHandler = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.athlete_id)) {
      return fail(res, 'Id dell\'atleta non valido');
    }
    const me = req.user;
    const competition = me.competition;
    const id = new mongoose.Types.ObjectId(req.params.athlete_id);
    const athlete = await Athlete.findById(id);
    if (!athlete) return fail(res, 'Atleta non trovato', 404);
    if (!athlete.competition.equals(competition._id)) {
      return fail(res, 'Non sei autorizzato', 403);
    }
    const new_athlete_category = await Category.findById(athlete.category);
    const new_athlete_ageclass = await AgeClass.findById(new_athlete_category.age_class);
    if (new_athlete_ageclass.closed) {
      return fail(res, 'L\'atleta non può essere eliminato, dato che la classe d\'età è chiusa');
    }
    await athlete.remove();
    success(res, athlete, 200);
  } catch (err) {
    console.error(err);
    fail(res, 'Errore interno: '+err.message, 500);
  }
};

/* TODO aggiungere classe pesi massimi, tipo 100+ */
async function computeCategory(
  birth_year: number,
  weight: number,
  gender: 'M' | 'F',
  competition: Types.ObjectId
) {
  const current_year: number = new Date().getFullYear();
  const athlete_age = current_year - birth_year;
  const age_classes = await AgeClass.find({
    competition,
    max_age: { $gt: athlete_age },
  });
  const best_age_class = age_classes.reduce((curr, age_class) => {
    if (curr === null || age_class.max_age < curr.max_age) {
      return age_class;
    }
    return curr;
  }, null);
  // controllo se best_age_class e' chiusa
  const categories = await Category.find({
    age_class: best_age_class._id,
    gender,
    max_weight: { $gt: weight },
  });
  const best_category = categories.reduce((curr, category) => {
    if (curr === null || category.max_weight < curr.max_weight) {
      return category;
    }
    return curr;
  }, null);

  return best_category?._id;
}
