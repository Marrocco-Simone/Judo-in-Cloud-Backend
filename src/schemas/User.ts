import { model, Schema, SchemaTypes, Types } from 'mongoose';

export interface UserInterface {
  username: string;
  password: string;
  competition: Types.ObjectId;
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
