// put here your routers
import { athlete_router } from './routers/athlete_router';
import { ageclass_router } from './routers/ageclass_router';
import { tournament_router } from './routers/tournament_router';
import { match_router } from './routers/match_router';

import express = require('express');
import cors = require('cors');
import 'dotenv/config';
import mongoose from 'mongoose';

const app = express();
const server_port = process.env.SERVER_PORT;
const server_url = process.env.SERVER_URL;
const mongo_url = process.env.MONGO_URL;

if ([server_port, server_url, mongo_url].includes(undefined)) {
  throw new Error('Application not correctly configured, please copy .env.example to .env ' +
    'and update it with your configuration, then restart.');
}

mongoose.connect(process.env.MONGO_URL);

// for cors policy
app.use(cors({ origin: '*' }));

// log requests
app.use((req, res, next) => {
  console.log(`requested ${req.url}`);
  next();
});

// It parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());

app.use('/api/v1/athletes', athlete_router);
app.use('/api/v1/age_classes', ageclass_router);
app.use('/api/v1/tournaments', tournament_router);
app.use('/api/v1/matches', match_router);

// not found page
app.get('*', async (req, res) => {
  res.status(404).send({
    success: 0,
    error: 'page not found'
  });
});

// start server
app.listen(server_port, () => console.log(`Listening on ${server_url}:${server_port}`));
