import { model, Schema, SchemaTypes, Types } from 'mongoose';
import { MatchInterface } from './Match';

export interface TournamentInterface {
  _id: Types.ObjectId;
  competition: Types.ObjectId;
  category: Types.ObjectId;
  tatami_number: number;
  finished: boolean;
  athletes: Types.ObjectId[];
  winners_bracket: (Types.ObjectId | MatchInterface)[][];
  recovered_bracket_1: (Types.ObjectId | MatchInterface)[][];
  recovered_bracket_2: (Types.ObjectId | MatchInterface)[][];
}

const tournament_schema = new Schema<TournamentInterface>({
  competition: {
    type: SchemaTypes.ObjectId,
    ref: 'Competition'
  },
  category: {
    type: SchemaTypes.ObjectId,
    ref: 'Category'
  },
  tatami_number: Number,
  finished: Boolean,
  athletes: [{
    type: SchemaTypes.ObjectId,
    ref: 'Athlete'
  }],
  winners_bracket: [[{
    type: SchemaTypes.ObjectId,
    ref: 'Match'
  }]],
  recovered_bracket_1: [[{
    type: SchemaTypes.ObjectId,
    ref: 'Match'
  }]],
  recovered_bracket_2: [[{
    type: SchemaTypes.ObjectId,
    ref: 'Match'
  }]],
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Tournament = model('Tournament', tournament_schema);
