import { model, Schema, SchemaTypes } from 'mongoose';

interface AthleteInterface {
  _id: String;
  name: String;
  surname: String;
  competition_id: String;
  club: String;
  gender: 'M' | 'F';
  weight: Number;
  birth_year: Number;
  category_id: String;
}

const athlete_schema = new Schema<AthleteInterface>({
  _id: SchemaTypes.ObjectId,
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

export const athlete = model('Athlete', athlete_schema);
