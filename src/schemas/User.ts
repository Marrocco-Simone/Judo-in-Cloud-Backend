import { model, Schema, SchemaTypes, Types } from 'mongoose';
import { CompetitionInterface } from './Competition';

export interface UserInterface {
  _id?: Types.ObjectId;
  username: string;
  password: string;
  competition: CompetitionInterface | Types.ObjectId;
}

const user_schema = new Schema<UserInterface>({
  username: String,
  password: String,
  competition: {
    type: SchemaTypes.ObjectId,
    ref: 'Competition'
  },
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const User = model('User', user_schema);
