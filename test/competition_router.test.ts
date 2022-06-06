import jwt from 'jsonwebtoken';
import { Competition, User } from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { app } from '../src/bootstrap';
import node_fetch from 'node-fetch';
import { Server } from 'http';

let server: Server;

const competition_id = new mongoose.Types.ObjectId();
const user_id_1 = new mongoose.Types.ObjectId();
const competition_slug = 'gara-lavis';

const competition_slug_route = `http://localhost:2500/api/v2/competitions/find/${competition_slug}`;
const invalid_slug_route = 'http://localhost:2500/api/v2/competitions/find/invalid-slug';

beforeAll(async () => {
  mongoose.connect(process.env.MONGO_URL_TEST);
  server = app.listen(2500);
});

beforeEach(async () => {
  const competition = new Competition({
    _id: competition_id,
    name: 'Gara Lavis',
    slug: 'gara-lavis'
  });
  await Competition.deleteMany({});
  await competition.save();
  const user = new User({
    _id: user_id_1,
    username: 'validUser',
    password: await bcrypt.hash('pwd', 10),
    competition: competition_id
  });
  await User.deleteMany({});
  await user.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  server.close();
});

test(`GET ${competition_slug_route} should return the competition`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;
  const res = await node_fetch(competition_slug_route, {
    method: 'GET',
    headers: { authorization, 'Content-Type': 'application/json' },
  });
  expect(res.status).toBe(200);
  const json_res = await res.json();
  expect(json_res.status).toBe('success');
});

test(`GET ${invalid_slug_route} should fail with status 404 not found`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;
  const res = await node_fetch(invalid_slug_route, {
    method: 'GET',
    headers: { authorization, 'Content-Type': 'application/json' },
  });
  expect(res.status).toBe(404);
  const json_res = await res.json();
  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});
