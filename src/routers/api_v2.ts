import app from 'express';
import { find_competition, get_tournaments } from '../controllers/competitions_controller';
import { get_tournament } from '../controllers/tournaments_controller';

export const api_v2_router = app.Router();

// routes for competitions
const competitions_router = app.Router();
competitions_router.get('/find/:slug', find_competition);
competitions_router.get('/:competition_id/tournaments', get_tournaments);

// routes for tournaments
const tournaments_router = app.Router();
tournaments_router.get('/:tournament_id', get_tournament);

api_v2_router.use('/competitions', competitions_router);
api_v2_router.use('/tournaments', tournaments_router);
