import { model, Schema, SchemaTypes } from "mongoose";

interface CategoryInterface  {
    _id: String,
    age_class_id: String,
    max_weight: String,
    gender: "M"|"F",
}

const CategorySchema = new Schema<CategoryInterface>({
    _id: SchemaTypes.ObjectId,
    age_class_id: {
        type: SchemaTypes.ObjectId,
        ref: "AgeClass",
    },
    max_weight: String,
    gender: String,
})

export const Category = model("Category", CategorySchema);