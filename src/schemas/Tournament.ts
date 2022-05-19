import { model, Schema, SchemaTypes } from 'mongoose';

export interface TournamentInterface {
  competition: string;
  category: string;
  tatami_number: number;
  finished: boolean;
  athletes: string[];
  winners_bracket: string[];
  recovered_bracket_1: string[];
  recovered_bracket_2: string[];
}

const tournament_schema = new Schema<TournamentInterface>({
  competition: String,
  category: String,
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Tournament = model('Tournament', tournament_schema);
