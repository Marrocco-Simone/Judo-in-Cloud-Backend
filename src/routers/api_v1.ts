import app from 'express';
import { get_age_class, get_age_classes, update_age_class } from '../controllers/age_classes_controller';
import { create_athlete, get_athletes } from '../controllers/athletes_controller';
import { get_match, update_match } from '../controllers/matches_controller';
import { get_next_matches, get_tournament, get_tournaments } from '../controllers/tournaments_controller';
import { authenticate_token } from '../middlewares/AuthenticateMiddleware';
import { requires_competition } from '../middlewares/RequiresCompetition';

export const api_v1_router = app.Router();

// routes for age classes
const age_classes_router = app.Router();
age_classes_router.use(authenticate_token, requires_competition);
age_classes_router.get('/', get_age_classes);
age_classes_router.get('/:age_class_id', get_age_class);
age_classes_router.post('/:age_class_id', update_age_class);

// routes for athletes
const athletes_router = app.Router();
athletes_router.use(authenticate_token, requires_competition);
athletes_router.get('/', get_athletes);
athletes_router.post('/', create_athlete);

// routes for matches
const matches_router = app.Router();
matches_router.use(authenticate_token, requires_competition);
matches_router.get('/:match_id', get_match);
matches_router.post('/:match_id', update_match);

// routes for tournaments
const tournaments_router = app.Router();
tournaments_router.use(authenticate_token, requires_competition);
tournaments_router.get('/', get_tournaments);
tournaments_router.get('/:tournament_id', get_tournament);
tournaments_router.get('/:tournament_id/next', get_next_matches);

api_v1_router.use('/age_classes', age_classes_router);
api_v1_router.use('/athletes', athletes_router);
api_v1_router.use('/matches', matches_router);
api_v1_router.use('/tournaments', tournaments_router);
