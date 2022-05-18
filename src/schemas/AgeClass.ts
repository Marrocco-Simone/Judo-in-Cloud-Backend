import { model, Schema, SchemaTypes } from 'mongoose';

interface AgeClassParamsInterface {
  match_time: number;
  supplemental_match_time: number;
  ippon_to_win: number;
  wazaari_to_win: number;
  ippon_timer: number;
  wazaari_timer: number;
}

const age_class_params_schema = new Schema<AgeClassParamsInterface>({
  match_time: Number,
  supplemental_match_time: Number,
  ippon_to_win: Number,
  wazaari_to_win: Number,
  ippon_timer: Number,
  wazaari_timer: Number,
});

interface AgeClassInterface {
  max_age: number;
  competition: string;
  name: string;
  closed: boolean;
  params: AgeClassParamsInterface;
}

const age_class_schema = new Schema<AgeClassInterface>({
  max_age: Number,
  competition: {
    type: SchemaTypes.ObjectId,
    ref: 'Competition'
  },
  name: String,
  closed: Boolean,
  params: age_class_params_schema,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AgeClass = model('AgeClass', age_class_schema);
