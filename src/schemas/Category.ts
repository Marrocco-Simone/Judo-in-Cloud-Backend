import { model, Schema, SchemaTypes, Types } from 'mongoose';

export interface CategoryInterface {
  age_class: Types.ObjectId;
  max_weight: number;
  gender: 'M'|'F';
}

const category_schema = new Schema<CategoryInterface>({
  age_class: {
    type: SchemaTypes.ObjectId,
    ref: 'AgeClass',
  },
  max_weight: String,
  gender: String,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Category = model('Category', category_schema);
