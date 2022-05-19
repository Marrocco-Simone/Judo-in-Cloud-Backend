import { model, Schema } from 'mongoose';

export interface CompetitionInterface {
  name: string;
}

const competition_schema = new Schema<CompetitionInterface>({
  name: String,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Competition = model('Competition', competition_schema);
