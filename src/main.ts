// put here your routers
import { athlete_router } from './routers/athlete_router';
import { ageclass_router } from './routers/ageclass_router';
import { tournament_router } from './routers/tournament_router';
import { match_router } from './routers/match_router';
import { auth_router } from './routers/auth_router';

import express = require('express');
import cors = require('cors');
import 'dotenv/config';
import mongoose from 'mongoose';
import { authenticate_token } from './middlewares/AuthenticateMiddleware';
import { UserInterface } from './schemas/User';
import { api_v2_router } from './routers/api_v2';

const app = express();
const server_port = process.env.PORT || process.env.SERVER_PORT;
const server_url = process.env.SERVER_URL;
const mongo_url = process.env.MONGO_URL;
const access_token_secret = process.env.ACCESS_TOKEN_SECRET;

if (
  [server_port, server_url, mongo_url, access_token_secret].includes(undefined)
) {
  throw new Error(
    'Application not correctly configured, please copy .env.example to .env ' +
      'and update it with your configuration, then restart.'
  );
}

mongoose.connect(process.env.MONGO_URL);

// handle type from middlewares
declare global {
  namespace Express {
    interface Request {
      user: UserInterface;
    }
  }
}

// for cors policy
app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// log requests
app.use((req, res, next) => {
  console.log(`requested ${req.method} ${req.url}`);
  next();
});

// It parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());

app.use('/api/v1/athletes', [authenticate_token, athlete_router]);
app.use('/api/v1/age_classes', [authenticate_token, ageclass_router]);
app.use('/api/v1/tournaments', [authenticate_token, tournament_router]);
app.use('/api/v1/match', [authenticate_token, match_router]);
app.use('/api/v1/auth', auth_router);
app.use('/api/v2/', api_v2_router);

// not found page
app.get('*', async (req, res) => {
  res.status(404).send({
    success: 0,
    error: 'page not found',
  });
});

// start server
app.listen(server_port, () =>
  console.log(`Listening on ${server_url}:${server_port}`)
);
