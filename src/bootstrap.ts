import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { UserInterface } from './schemas/User';
import { api_v2_router } from './routers/api_v2';
import { api_v1_router } from './routers/api_v1';

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

app.use('/api/v1/', api_v1_router);
app.use('/api/v2/', api_v2_router);

// not found page
app.get('*', async (req, res) => {
  res.status(404).send({
    success: 0,
    error: 'page not found',
  });
});
