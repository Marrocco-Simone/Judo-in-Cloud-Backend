import { model, Schema, SchemaTypes, Types } from 'mongoose';

export interface TournamentInterface {
  competition: Types.ObjectId;
  category: Types.ObjectId;
  tatami_number: number;
  finished: boolean;
  athletes: Types.ObjectId[];
  winners_bracket: Types.ObjectId[][];
  recovered_bracket_1: Types.ObjectId[][];
  recovered_bracket_2: Types.ObjectId[][];
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
