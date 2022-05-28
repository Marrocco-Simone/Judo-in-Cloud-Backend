import app from 'express';
import { find_competition } from '../controllers/competitions_controller';

export const api_v2_router = app.Router();

// routes for competitions
const competitions_router = app.Router();
competitions_router.get('/find/:slug', find_competition);

api_v2_router.use('/competitions', competitions_router);
