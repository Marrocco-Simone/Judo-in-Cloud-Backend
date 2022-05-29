import express = require('express');
import { AgeClass, AgeClassInterface } from '../schemas/AgeClass';
import { success, error, fail } from '../controllers/base_controller';
import { Athlete, Category, Match, Tournament } from '../schemas';
import { generateMainBracket } from '../helpers/bracket_utils';
import { CompetitionInterface } from '../schemas/Competition';
import { CategoryInterface } from '../schemas/Category';
/** api for matches */
export const ageclass_router = express.Router();

ageclass_router.get('/', async (req, res) => {
  try {
    const age_classes = await AgeClass.find();
    const categories = await Category.find();
    const age_classes_result: (AgeClassInterface & {
      categories?: CategoryInterface[];
    })[] = [];
    for (const age_class of age_classes) {
      age_classes_result.push(age_class.toObject());
    }
    for (const age_class of age_classes_result) {
      age_class.categories = [];
      for (const cat of categories) {
        if (cat.age_class.equals(age_class._id)) {
          age_class.categories.push(cat.toObject());
        }
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

    if (body.closed != null) age_class.closed = body.closed;
    if (body.params != null) age_class.params = body.params;

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

    const main_bracket = generateMainBracket(tournament, category_athletes);

    // save all the existing matches
    tournament.winners_bracket = await Promise.all(
      main_bracket.map(async (round_data) => {
        return await Promise.all(
          round_data.map(async (match_data) => {
            if (match_data === null) {
              return null;
            }
            const match = new Match(match_data);
            await match.save();
            match_data._id = match._id;
            return match._id;
          })
        );
      })
    );

    // save the tournament again, this time with the winners bracket
    await tournament.save();
  }
}

/* GIRARDI: API V2 */
/* se la classe d'eta' e' aperta, allora ritorniamo che e' possibile riaprirla */
ageclass_router.get('/reopen/:age_class_id', async (req, res) => {
  try {
    const age_class_id = req.params.age_class_id;
    const age_class = await AgeClass.findById(age_class_id);
    if (!age_class) return fail(res, 'Age Class not found');
    if (!age_class.closed) return success(res, { can_reopen: true });

    const category = await Category.find({ age_class: age_class_id });
    const category_ids = category.map((cat) => cat._id);

    const tournament = await Tournament.find({
      category: { $in: category_ids },
    }).populate({
      path: 'winners_bracket',
      model: 'Match',
    });

    for (const tour of tournament) {
      for (const bracket of tour.winners_bracket) {
        for (const match of bracket) {
          // @ts-ignore
          if (match?.is_started) return success(res, { can_reopen: false });
        }
      }
    }

    return success(res, { can_reopen: true });
  } catch (err) {
    console.error({ err });
    error(res, err.message);
  }
});

/* GIRARDI: API V2 */
/* se la classe d'eta' e' gia' aperta, ritorniamo esito positivo */
ageclass_router.post('/reopen/:age_class_id', async (req, res) => {
  try {
    const age_class_id = req.params.age_class_id;
    const age_class = await AgeClass.findById(age_class_id);
    if (!age_class) return fail(res, 'Age Class not found');
    if (!age_class.closed) return success(res, age_class);

    const category = await Category.find({ age_class: age_class_id });
    const category_ids = category.map((cat) => cat._id);

    const tournament = await Tournament.find({
      category: { $in: category_ids },
    });
    const tournament_ids = tournament.map((tour) => tour._id);

    await Match.deleteMany({ tournament: { $in: tournament_ids } });
    await Tournament.deleteMany({ category: { $in: category_ids } });

    age_class.closed = false;
    await age_class.save();

    return success(res, age_class);
  } catch (err) {
    console.error({ err });
    error(res, err.message);
  }
});
