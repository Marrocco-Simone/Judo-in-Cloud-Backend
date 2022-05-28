import express from 'express';
import { login, me } from '../controllers/auth_controller';
import { authenticate_token } from '../middlewares/AuthenticateMiddleware';
/** apis for authentication */
export const auth_router = express.Router();

auth_router.post('/', login);
auth_router.get('/', [authenticate_token, me]);
