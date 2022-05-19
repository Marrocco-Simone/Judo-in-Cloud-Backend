import { model, Schema, SchemaTypes } from 'mongoose';

interface AgeClassInterface {
  _id: String;
  max_age: Number;
  competition_id: String;
  name: String;
  closed: Boolean;
  params: {
    match_time: Number;
    supplemental_match_time: Number;
    ippon_to_win: Number;
    wazaari_to_win: Number;
    ippon_timer: Number;
    wazaari_timer: Number;
  };
}

const age_class_schema = new Schema<AgeClassInterface>({
  _id: SchemaTypes.ObjectId,
  max_age: Number,
  competition_id: {
    type: SchemaTypes.ObjectId,
    ref: 'Competition',
  },
  name: String,
  closed: Boolean,
  params: {
    match_time: Number,
    supplemental_match_time: Number,
    ippon_to_win: Number,
    wazaari_to_win: Number,
    ippon_timer: Number,
    wazaari_timer: Number,
  },
});

export const age_class = model('AgeClass', age_class_schema);
