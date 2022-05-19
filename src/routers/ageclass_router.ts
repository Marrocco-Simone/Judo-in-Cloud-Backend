import express = require('express');
import { AgeClass } from '../schemas/AgeClass';
import { success, error, fail } from '../controllers/base_controller';
/** api for matches */
export const ageclass_router = express.Router();

ageclass_router.get('/', async (req, res) => {
  try {
    const age_classes = await AgeClass.find();
    success(res, age_classes);
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

    const params_to_set = {
      closed: body.closed,
      params: body.params
    };

    const new_age_class = await AgeClass.updateOne({ _id: age_class_id }, { $set: params_to_set }, { upsert: true });

    // TODO: add conditions on closed age class

    success(res, new_age_class);
  } catch (e) {
    error(res, e.message);
  }
});
