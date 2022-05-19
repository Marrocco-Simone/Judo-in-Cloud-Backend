import { Types } from 'mongoose';
import { AgeClass, AgeClassInterface } from './schemas/AgeClass';
import { Athlete, AthleteInterface } from './schemas/Athlete';
import { Category, CategoryInterface } from './schemas/Category';
import { Competition, CompetitionInterface } from './schemas/Competition';
import { Match, MatchInterface } from './schemas/Match';
import { Tournament, TournamentInterface } from './schemas/Tournament';
import { User, UserInterface } from './schemas/User';

function getIds(obj: { _id: Types.ObjectId }[]) {
  const ids_array: Types.ObjectId[] = [];
  for (const elem of obj) ids_array.push(elem._id);
  return ids_array;
}

function getCompetitions() {
  const competition_array: CompetitionInterface[] = [];
  competition_array.push({
    username: 'admin',
    password: 'password',
    name: 'Gara Lavis',
  });
  return competition_array;
}

function getAgeClasses(competition_ids: Types.ObjectId[]) {
  const age_class_array: AgeClassInterface[] = [];
  age_class_array.push(
    {
      max_age: 15,
      competition: competition_ids[0],
      name: 'Esordienti B',
      closed: false,
      params: {
        match_time: 120,
        supplemental_match_time: 120,
        ippon_to_win: 1,
        wazaari_to_win: 2,
        ippon_timer: 20,
        wazaari_timer: 10,
      },
    },
    {
      max_age: 18,
      competition: competition_ids[0]._id,
      name: 'Cadetti',
      closed: false,
      params: {
        match_time: 180,
        supplemental_match_time: 180,
        ippon_to_win: 1,
        wazaari_to_win: 2,
        ippon_timer: 20,
        wazaari_timer: 10,
      },
    },
    {
      max_age: 21,
      competition: competition_ids[0]._id,
      name: 'Juniores',
      closed: false,
      params: {
        match_time: 240,
        supplemental_match_time: Infinity,
        ippon_to_win: 1,
        wazaari_to_win: 2,
        ippon_timer: 20,
        wazaari_timer: 10,
      },
    }
  );
  return age_class_array;
}

function getCategories(age_class_ids: Types.ObjectId[]) {
  const categories_array: CategoryInterface[] = [];
  for (const age_class of age_class_ids) {
    categories_array.push(
      {
        age_class,
        max_weight: 60,
        gender: 'M',
      },
      {
        age_class,
        max_weight: 66,
        gender: 'M',
      },
      {
        age_class,
        max_weight: 52,
        gender: 'F',
      },
      {
        age_class,
        max_weight: 57,
        gender: 'F',
      }
    );
  }
  return categories_array;
}

async function main() {
  try {
    const competition = await Competition.insertMany(getCompetitions());
    const competition_ids = getIds(competition);
    const age_class = await AgeClass.insertMany(getAgeClasses(competition_ids));
    const age_class_ids = getIds(age_class);
    const category = await Category.insertMany(getCategories(age_class_ids));
  } catch (e) {
    console.log(e.message);
  }
}

main();
