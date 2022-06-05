import app from 'express';
import { is_age_class_reopenable, reopen_age_class } from '../controllers/age_classes_controller';
import { delete_athlete, get_athletes_by_club, get_clubs, update_athlete } from '../controllers/athletes_controller';
import { find_competition, get_competition_tournaments } from '../controllers/competitions_controller';
import { get_tournament, reserve_tournament } from '../controllers/tournaments_controller';
import { test } from '../controllers/super_users_controller';
import { authenticate_token } from '../middlewares/AuthenticateMiddleware';
import { requires_competition } from '../middlewares/RequiresCompetition';

export const api_v2_router = app.Router();

// routes for competitions
const competitions_router = app.Router();
competitions_router.get('/find/:slug', find_competition);
competitions_router.get('/:competition_id/tournaments', get_competition_tournaments);

// routes for tournaments
const tournaments_router = app.Router();
tournaments_router.get('/:tournament_id', get_tournament);

tournaments_router.use(authenticate_token, requires_competition);
tournaments_router.post('/reserve/:tournament_id', reserve_tournament);

// endpoints for age classes
const age_classes_router = app.Router();
age_classes_router.use(authenticate_token, requires_competition);
age_classes_router.get('/reopen/:age_class_id', is_age_class_reopenable);
age_classes_router.post('/reopen/:age_class_id', reopen_age_class);

// routes for athletes
const athletes_router = app.Router();
athletes_router.get('/club', get_clubs);
athletes_router.get('/club/:club', get_athletes_by_club);

athletes_router.use(authenticate_token, requires_competition);
athletes_router.put('/:athlete_id', update_athlete);
athletes_router.delete('/:athlete_id', delete_athlete);

// routes for super admin
const super_users_router = app.Router();
super_users_router.use(authenticate_token, requires_competition);
// TODO eliminare
super_users_router.get('/test', test);

api_v2_router.use('/competitions', competitions_router);
api_v2_router.use('/tournaments', tournaments_router);
api_v2_router.use('/age_classes', age_classes_router);
api_v2_router.use('/athletes', athletes_router);
api_v2_router.use('/superuser', super_users_router);
