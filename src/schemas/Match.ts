import { model, Schema, SchemaTypes } from 'mongoose';

interface MatchScoresInterface {
  final_time: number;
  white_ippon: number;
  white_wazaari: number;
  white_penalties: number;
  red_ippon: number;
  red_wazaari: number;
  red_penalties: number;
}

const match_score_schema = new Schema<MatchScoresInterface>({
  final_time: Number,
  white_ippon: Number,
  white_wazaari: Number,
  white_penalties: Number,
  red_ippon: Number,
  red_wazaari: Number,
  red_penalties: Number,
});

type MatchTypeInterface = 'principale'|'recupero'|'finale 3-5'|'finale 1-2'|'quarto di finale'|'semifinale'

interface MatchInterface {
  white_athlete: string;
  red_athlete: string;
  winner_athlete: string;
  tournament: string;
  is_started: boolean;
  is_over: boolean;
  match_type: MatchTypeInterface;
  match_scores: MatchScoresInterface;
}

const match_schema = new Schema<MatchInterface>({
  white_athlete: {
    type: SchemaTypes.ObjectId,
    ref: 'Athlete',
  },
  red_athlete: {
    type: SchemaTypes.ObjectId,
    ref: 'Athlete',
  },
  winner_athlete: {
    type: SchemaTypes.ObjectId,
    ref: 'Athlete',
  },
  tournament: {
    type: SchemaTypes.ObjectId,
    ref: 'Tournament',
  },
  is_started: Boolean,
  is_over: Boolean,
  match_type: String,
  match_scores: match_score_schema
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Match = model('Match', match_schema);
