import { model, Schema, SchemaTypes, Types } from 'mongoose';
export interface MatchInterface {
  white_athlete: Types.ObjectId;
  red_athlete: Types.ObjectId;
  winner_athlete: Types.ObjectId;
  tournament: Types.ObjectId;
  is_started: boolean;
  is_over: boolean;
  match_type: number;
  match_scores: {
    final_time: number;
    white_ippon: number;
    white_wazaari: number;
    white_penalties: number;
    red_ippon: number;
    red_wazaari: number;
    red_penalties: number;
  };
}

const match_schema = new Schema<MatchInterface>({
  white_athlete: {
    type: SchemaTypes.ObjectId,
    ref: 'Athlete',
  },
  red_athlete: {
    type: SchemaTypes.ObjectId,
    ref: 'Athlete',
  },
  winner_athlete: {
    type: SchemaTypes.ObjectId,
    ref: 'Athlete',
  },
  tournament: {
    type: SchemaTypes.ObjectId,
    ref: 'Tournament',
  },
  is_started: Boolean,
  is_over: Boolean,
  match_type: Number,
  match_scores: {
    final_time: Number,
    white_ippon: Number,
    white_wazaari: Number,
    white_penalties: Number,
    red_ippon: Number,
    red_wazaari: Number,
    red_penalties: Number,
  }
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Match = model('Match', match_schema);
