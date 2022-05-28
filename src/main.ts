// put here your routers
import { athlete_router } from './routers/athlete_router';
import { ageclass_router } from './routers/ageclass_router';
import { tournament_router } from './routers/tournament_router';
import { match_router } from './routers/match_router';
import { auth_router } from './routers/auth_router';

import express = require('express');
import cors = require('cors');
import 'dotenv/config';
import { authenticate_token } from './middlewares/AuthenticateMiddleware';
import { UserInterface } from './schemas/User';

export const app = express();

// handle type from middlewares
declare global {
  namespace Express {
    interface Request {
      user: UserInterface;
    }
  }
}

// for cors policy
app.use(cors({ origin: '*' }));

// log requests
app.use((req, res, next) => {
  console.log(`requested ${req.url}`);
  next();
});

// It parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());

app.use('/api/v1/athletes', [authenticate_token, athlete_router]);
app.use('/api/v1/age_classes', [authenticate_token, ageclass_router]);
app.use('/api/v1/tournaments', [authenticate_token, tournament_router]);
app.use('/api/v1/match', [authenticate_token, match_router]);
app.use('/api/v1/auth', auth_router);

// not found page
app.get('*', async (req, res) => {
  res.status(404).send({
    success: 0,
    error: 'page not found'
  });
});
