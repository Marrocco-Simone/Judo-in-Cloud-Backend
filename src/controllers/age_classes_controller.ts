import { RequestHandler } from 'express';
import { AgeClass, AgeClassInterface } from '../schemas/AgeClass';
import { success, error, fail } from '../controllers/base_controller';
import { Athlete, Category, Match, Tournament } from '../schemas';
import { toJicBracket, storeJicBrackets, generateBrackets } from '../helpers/bracket_utils';
import { CompetitionInterface } from '../schemas/Competition';
import { CategoryInterface } from '../schemas/Category';

export const get_age_classes: RequestHandler = async (req, res) => {
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
};

export const get_age_class: RequestHandler = async (req, res) => {
  try {
    const age_class_id = req.params.age_class_id;
    const age_class = await AgeClass.findById(age_class_id);
    if (!age_class) return fail(res, 'Age class not found', 404);
    success(res, age_class);
  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
};

export const update_age_class: RequestHandler = async (req, res) => {
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
    if (body.params != null) {
      const { match_time, supplemental_match_time, ippon_to_win, wazaari_to_win, ippon_timer, wazaari_timer } = body.params;

      if (!match_time || !supplemental_match_time || !ippon_to_win || !wazaari_to_win || !ippon_timer || !wazaari_timer) return fail(res, 'Campi incompleti');

      age_class.params = body.params;
    }

    await age_class.save();

    success(res, age_class);
  } catch (err) {
    console.error({ err });
    error(res, err.message);
  }
};

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

/* API V2 */
/* se la classe d'eta' e' aperta, allora ritorniamo che e' possibile riaprirla */
export const is_age_class_reopenable: RequestHandler = async (req, res) => {
  try {
    const age_class_id = req.params.age_class_id;
    const age_class = await AgeClass.findById(age_class_id);
    if (!age_class) return fail(res, 'Age class not found');
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
};

/* API V2 */
/* se la classe d'eta' e' gia' aperta, ritorniamo esito positivo */
export const reopen_age_class: RequestHandler = async (req, res) => {
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
};
