import app from 'express';
import { get_age_class, get_age_classes, update_age_class } from '../controllers/age_classes_controller';
import { authenticate_token } from '../middlewares/AuthenticateMiddleware';
import { requires_competition } from '../middlewares/RequiresCompetition';

export const api_v1_router = app.Router();

// routes for age classes
const age_classes_router = app.Router();
age_classes_router.use(authenticate_token, requires_competition);
age_classes_router.get('/', get_age_classes);
age_classes_router.get('/:age_class_id', get_age_class);
age_classes_router.post('/:age_class_id', update_age_class);

api_v1_router.use('/age_classes', age_classes_router);
