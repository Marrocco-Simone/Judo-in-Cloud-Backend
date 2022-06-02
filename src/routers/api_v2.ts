import app from 'express';
import { is_age_class_reopenable, reopen_age_class } from '../controllers/age_classes_controller';
import { find_competition, get_tournaments } from '../controllers/competitions_controller';
import { get_tournament } from '../controllers/tournaments_controller';
import { authenticate_token } from '../middlewares/AuthenticateMiddleware';
import { requires_competition } from '../middlewares/RequiresCompetition';

export const api_v2_router = app.Router();

// routes for competitions
const competitions_router = app.Router();
competitions_router.get('/find/:slug', find_competition);
competitions_router.get('/:competition_id/tournaments', get_tournaments);

// routes for tournaments
const tournaments_router = app.Router();
tournaments_router.get('/:tournament_id', get_tournament);

// endpoints for age classes
const age_classes_router = app.Router();
age_classes_router.use(authenticate_token, requires_competition);
age_classes_router.get('/reopen/:age_class_id', is_age_class_reopenable);
age_classes_router.post('/reopen/:age_class_id', reopen_age_class);

api_v2_router.use('/competitions', competitions_router);
api_v2_router.use('/tournaments', tournaments_router);
api_v2_router.use('/age_classes', age_classes_router);
