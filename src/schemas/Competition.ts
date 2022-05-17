import { model, Schema } from 'mongoose';

interface CompetitionInterface {
  name: string;
  username: string;
  password: string;
}

const competition_schema = new Schema<CompetitionInterface>({
  name: String,
  username: String,
  password: String,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Competition = model('Competition', competition_schema);
