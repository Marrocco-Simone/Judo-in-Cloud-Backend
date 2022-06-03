import { model, Schema, Types } from 'mongoose';

export interface CompetitionInterface {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
}

const competition_schema = new Schema<CompetitionInterface>({
  name: String,
  slug: String,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Competition = model('Competition', competition_schema);
