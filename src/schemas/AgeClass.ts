import { model, Schema, SchemaTypes } from "mongoose";

interface AgeClassParamsInterface  {
    match_time: Number,
    supplemental_match_time: Number,
    ippon_to_win: Number,
    wazaari_to_win: Number,
    ippon_timer: Number,
    wazaari_timer: Number,
}

const AgeClassParamsSchema = new Schema<AgeClassParamsInterface>({
    match_time: Number,
    supplemental_match_time: Number,
    ippon_to_win: Number,
    wazaari_to_win: Number,
    ippon_timer: Number,
    wazaari_timer: Number,
})

interface AgeClassInterface  {
    _id: String,
    max_age: Number,
    competition_id?: String,
    name: String,
    closed: boolean,
    params: AgeClassParamsInterface,
}

const AgeClassSchema = new Schema<AgeClassInterface>({
    _id: SchemaTypes.ObjectId,
    max_age: Number,
    competition_id: {
        type: SchemaTypes.ObjectId,
        ref: "Competition"
    },
    name: String,
    closed: Boolean,
    params: AgeClassParamsSchema,
})

export const AgeClass = model("AgeClass", AgeClassSchema);