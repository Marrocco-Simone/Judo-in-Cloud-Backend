import mongoose from 'mongoose';
import { app } from '../src/bootstrap';

const server_port = process.env.SERVER_PORT;
const server_url = process.env.SERVER_URL;
const mongo_url = process.env.ENV === 'test' ? process.env.MONGO_URL_TEST : process.env.MONGO_URL;
const access_token_secret = process.env.ACCESS_TOKEN_SECRET;

if ([server_port, server_url, mongo_url, access_token_secret].includes(undefined)) {
  throw new Error('Application not correctly configured, please copy .env.example to .env ' +
    'and update it with your configuration, then restart.');
}

mongoose.connect(mongo_url);

// start server
app.listen(server_port, () => console.log(`Listening on ${server_url}:${server_port}`));
