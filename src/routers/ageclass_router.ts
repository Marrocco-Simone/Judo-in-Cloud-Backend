import express = require('express');
import { AgeClass, AgeClassInterface } from '../schemas/AgeClass';
import { success, error, fail } from '../controllers/base_controller';
import { Athlete, Category, Tournament } from '../schemas';
import { toJicBracket, storeJicBrackets, generateBrackets } from '../helpers/bracket_utils';
import { CompetitionInterface } from '../schemas/Competition';
import { CategoryInterface } from '../schemas/Category';
/** api for matches */
export const ageclass_router = express.Router();

ageclass_router.get('/', async (req, res) => {
  try {
    const age_classes = await AgeClass.find();
    const categories = await Category.find();
    const age_classes_result: (typeof age_classes[0] & {
    categories?: CategoryInterface[]
  })[] = age_classes;
    for (const age_class of age_classes_result) {
      age_class.categories = [];
      for (const cat of categories) {
        if (cat.age_class === age_class._id) age_class.categories.push(cat);
      }
    }
    success(res, age_classes_result);
  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
});

ageclass_router.get('/:age_class_id', async (req, res) => {
  try {
    const age_class_id = req.params.age_class_id;
    const age_class = await AgeClass.findById(age_class_id);
    if (!age_class) return fail(res, 'Age class not found', 404);
    success(res, age_class);
  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
});

ageclass_router.post('/:age_class_id', async (req, res) => {
  const user = req.user;
  const competition = user.competition;
  try {
    const age_class_id = req.params.age_class_id;
    const age_class = await AgeClass.findById(age_class_id);
    if (!age_class) return fail(res, 'Age class not found', 404);
    const body: {
      closed: boolean;
      params: {
        match_time: number;
        supplemental_match_time: number;
        ippon_to_win: number;
        wazaari_to_win: number;
        ippon_timer: number;
        wazaari_timer: number;
      };
    } = req.body;

    if (!age_class.closed && body.closed) {
      // this is a newly closed class
      await closeAgeClass(competition as CompetitionInterface, age_class);
    }

    age_class.closed = body.closed;
    age_class.params = body.params;

    await age_class.save();

    success(res, age_class);
  } catch (err) {
    console.error({ err });
    error(res, err.message);
  }
});

async function closeAgeClass(
  competition: CompetitionInterface,
  age_class: AgeClassInterface
) {
  const categories = await Category.find({ age_class: age_class._id });

  for (const category of categories) {
    const category_athletes = await Athlete.find({ category });
    if (category_athletes.length === 0) {
      // no tournament necessary...
      continue;
    }

    // create a new tournament for the category
    const tournament = new Tournament({
      competition: competition._id,
      category: category._id,
      tatami_number: 0,
      finished: false,
      athletes: category_athletes.map((x) => x._id),
      winners_bracket: [],
      recovered_bracket_1: [],
      recovered_bracket_2: [],
    });
    await tournament.save();

    const brackets = generateBrackets(category_athletes.map(athlete => athlete._id));
    await storeJicBrackets(
      tournament,
      toJicBracket(brackets.main, tournament),
      toJicBracket(brackets.recovery[0], tournament),
      toJicBracket(brackets.recovery[1], tournament)
    );
  }
}
