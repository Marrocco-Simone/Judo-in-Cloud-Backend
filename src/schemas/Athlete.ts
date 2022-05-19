import { model, Schema, SchemaTypes } from 'mongoose';

export interface AthleteInterface {
  name: string;
  surname: string;
  competition: string;
  club: string;
  gender: 'M'|'F';
  weight: number;
  birth_year: number;
  category: string;
}

const athlete_schema = new Schema<AthleteInterface>({
  name: String,
  surname: String,
  competition: {
    type: SchemaTypes.ObjectId,
    ref: 'Competition',
  },
  club: String,
  gender: String,
  weight: Number,
  birth_year: Number,
  category: {
    type: SchemaTypes.ObjectId,
    ref: 'Category',
  },
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Athlete = model('Athlete', athlete_schema);
