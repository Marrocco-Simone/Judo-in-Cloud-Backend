import { model, Schema, SchemaTypes } from 'mongoose';
interface MatchInterface {
  _id: String;
  white_athlete_id: String;
  red_athlete_id: String;
  winner_athlete_id: String;
  tournament_id: String;
  is_started: Boolean;
  is_over: Boolean;
  match_type: Number;
  match_scores: {
    final_time: Number;
    white_ippon: Number;
    white_wazaari: Number;
    white_penalties: Number;
    red_ippon: Number;
    red_wazaari: Number;
    red_penalties: Number;
  };
}

const match_schema = new Schema<MatchInterface>({
  _id: String,
  white_athlete_id: {
    type: SchemaTypes.ObjectId,
    ref: 'Athlete',
  },
  red_athlete_id: {
    type: SchemaTypes.ObjectId,
    ref: 'Athlete',
  },
  winner_athlete_id: {
    type: SchemaTypes.ObjectId,
    ref: 'Athlete',
  },
  tournament_id: {
    type: SchemaTypes.ObjectId,
    ref: 'Tournament',
  },
  is_started: Boolean,
  is_over: Boolean,
  match_type: String,
  match_scores: {
    final_time: Number,
    white_ippon: Number,
    white_wazaari: Number,
    white_penalties: Number,
    red_ippon: Number,
    red_wazaari: Number,
    red_penalties: Number,
  },
});

export const match = model('Match', match_schema);
