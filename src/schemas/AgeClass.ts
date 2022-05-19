import { model, Schema, SchemaTypes, Types } from 'mongoose';

export interface AgeClassInterface {
  max_age: number;
  competition: Types.ObjectId;
  name: string;
  closed: boolean;
  params: {
    match_time: number;
    supplemental_match_time: number;
    ippon_to_win: number;
    wazaari_to_win: number;
    ippon_timer: number;
    wazaari_timer: number;
  };
}

const age_class_schema = new Schema<AgeClassInterface>({
  max_age: Number,
  competition: {
    type: SchemaTypes.ObjectId,
    ref: 'Competition'
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AgeClass = model('AgeClass', age_class_schema);
