import { model, Schema, SchemaTypes } from 'mongoose';

interface AthleteInterface {
  name: string;
  surname: string;
  competition_id: string;
  club: string;
  gender: 'M'|'F';
  weight: number;
  birth_year: number;
  category_id: string;
}

const athlete_schema = new Schema<AthleteInterface>({
  name: String,
  surname: String,
  competition_id: {
    type: SchemaTypes.ObjectId,
    ref: 'Competition',
  },
  club: String,
  gender: String,
  weight: Number,
  birth_year: Number,
  category_id: {
    type: SchemaTypes.ObjectId,
    ref: 'Category',
  },
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Athlete = model('Athlete', athlete_schema);
