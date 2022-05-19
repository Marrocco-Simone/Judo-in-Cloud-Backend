import { model, Schema, SchemaTypes } from 'mongoose';

export export interface UserInterface {
  username: string;
  password: string;
  competition: string;
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
