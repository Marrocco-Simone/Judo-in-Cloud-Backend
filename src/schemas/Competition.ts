import { model, Schema, SchemaTypes } from 'mongoose';

interface CompetitionInterface {
  _id: String,
  name: String,
  username: String,
  password: String,
}

const competition_schema = new Schema<CompetitionInterface>({
  _id: SchemaTypes.ObjectId,
  name: String,
  username: String,
  password: String,
});

export const competition = model('Competition', competition_schema);
