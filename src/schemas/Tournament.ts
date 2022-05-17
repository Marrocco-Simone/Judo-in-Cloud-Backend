import { model, Schema, SchemaTypes } from 'mongoose';

interface TournamentInterface {
  _id: String,
  competition_id: String,
  category_id: String,
  tatami_number: Number,
  finished: Boolean,
  athletes: string[],
  winners_bracket: string[],
  recovered_bracket_1: string[],
  recovered_bracket_2: string[],
}

const tournament_schema = new Schema<TournamentInterface>({
  _id: SchemaTypes.ObjectId,
  competition_id: String,
  category_id: String,
  tatami_number: Number,
  finished: Boolean,
  athletes: [{
    type: SchemaTypes.ObjectId,
    ref: 'Athlete'
  }],
  winners_bracket: [{
    type: SchemaTypes.ObjectId,
    ref: 'Match'
  }],
  recovered_bracket_1: [{
    type: SchemaTypes.ObjectId,
    ref: 'Match'
  }],
  recovered_bracket_2: [{
    type: SchemaTypes.ObjectId,
    ref: 'Match'
  }],
});

export const tournament = model('Tournament', tournament_schema);
