import { model, Schema, SchemaTypes } from "mongoose";

interface MatchScoresInterface  {
    final_time: Number,
    white_ippon: Number,
    white_wazaari: Number,
    white_penalties: Number,
    red_ippon: Number,
    red_wazaari: Number,
    red_penalties: Number,
}

const MatchScoresSchema = new Schema<MatchScoresInterface>({
    final_time: Number,
    white_ippon: Number,
    white_wazaari: Number,
    white_penalties: Number,
    red_ippon: Number,
    red_wazaari: Number,
    red_penalties: Number,
})

type MatchTypeInterface = 'principale'|'recupero'|'finale 3-5'|'finale 1-2'|'quarto di finale'|'semifinale'

interface MatchInterface  {
    _id: String,
    white_athlete_id?: String,
    red_athlete_id?: String,
    winner_athlete_id?: String,
    tournament_id?: String,
    is_started: boolean,
    is_over: boolean,
    match_type: MatchTypeInterface,
    match_scores: MatchScoresInterface
}

const MatchSchema = new Schema<MatchInterface>({
    _id: String,
    white_athlete_id: {
        type: SchemaTypes.ObjectId,
        ref: "Athlete",
    },
    red_athlete_id: {
        type: SchemaTypes.ObjectId,
        ref: "Athlete",
    },
    winner_athlete_id: {
        type: SchemaTypes.ObjectId,
        ref: "Athlete",
    },
    tournament_id: {
        type: SchemaTypes.ObjectId,
        ref: "Tournament",
    },
    is_started: Boolean,
    is_over: Boolean,
    match_type: String,
    match_scores: MatchScoresSchema
})

export const Match = model("Match", MatchSchema);