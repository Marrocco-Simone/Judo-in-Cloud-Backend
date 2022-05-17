import express = require('express');
import { login } from '../controllers/auth_controller';
/** apis for authentication */
export const auth_router = express.Router();

auth_router.post('/login', login);
