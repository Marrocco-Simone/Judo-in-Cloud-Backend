import jwt from 'jsonwebtoken';
import { Competition, Tournament, User } from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { app } from '../src/bootstrap';
import node_fetch from 'node-fetch';
import { Server } from 'http';

let server: Server;

const user_id_1 = new mongoose.Types.ObjectId();
const competition_id = new mongoose.Types.ObjectId();
const tournament_id = new mongoose.Types.ObjectId();
const unauth_tournament_id = new mongoose.Types.ObjectId();

const tour_reserve_route = `http://localhost:2500/api/v2/tournaments/reserve/${tournament_id}`;
const non_existent_tour_reserve_route = `http://localhost:2500/api/v2/tournaments/reserve/${new mongoose.Types.ObjectId()}`;
const invalid_tour_reserve_route = 'http://localhost:2500/api/v2/tournaments/reserve/123';
const unauth_tour_reserve_route = `http://localhost:2500/api/v2/tournaments/reserve/${unauth_tournament_id}`;

beforeAll(async () => {
  mongoose.connect(process.env.MONGO_URL_TEST);

  server = app.listen(2500);
});

beforeEach(async () => {
  const competition = new Competition({
    _id: competition_id,
    name: 'competition'
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

  const tournament = new Tournament({
    _id: tournament_id,
    competition: competition_id,
    category: new mongoose.Types.ObjectId(),
    tatami_number: null,
    finished: false,
    athletes: [],
    winners_bracket: [],
    recovered_bracket_1: [],
    recovered_bracket_2: [],
  });
  const unauth_tournament = new Tournament({
    _id: unauth_tournament_id,
    competition: competition_id,
    category: new mongoose.Types.ObjectId(),
    tatami_number: null,
    finished: false,
    athletes: [],
    winners_bracket: [],
    recovered_bracket_1: [],
    recovered_bracket_2: [],
  });
  await Tournament.deleteMany({});
  await tournament.save();
  await unauth_tournament.save();
});

afterAll(async () => {
  await mongoose.disconnect();

  server.close();
});

test(`POST ${tour_reserve_route} should reserve the tournament`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(tour_reserve_route, {
    method: 'POST',
    body: JSON.stringify({ tatami_number: 1 }),
    headers: { authorization, 'Content-Type': 'application/json' },
  });
  expect(res.status).toBe(200);

  const json_res = await res.json();
  expect(json_res.status).toBe('success');
  expect(json_res.data.tatami_number).toBe(1);
});

test(`POST ${non_existent_tour_reserve_route} should fail with status 404 not found`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(non_existent_tour_reserve_route, {
    method: 'POST',
    body: JSON.stringify({ tatami_number: 1 }),
    headers: { authorization, 'Content-Type': 'application/json' },
  });
  expect(res.status).toBe(404);

  const json_res = await res.json();
  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`POST ${invalid_tour_reserve_route} should fail with status 400 since the id is invalid`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(invalid_tour_reserve_route, {
    method: 'POST',
    body: JSON.stringify({ tatami_number: 1 }),
    headers: { authorization, 'Content-Type': 'application/json' },
  });
  expect(res.status).toBe(400);

  const json_res = await res.json();
  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`POST ${tour_reserve_route} without passing a valid tatami number should fail with status 400`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const invalid_bodies = [
    { tatami_number: -1 },
    { tatami_number: null },
    { tatami_number: 'foo' },
    { },
  ];

  for (const body of invalid_bodies) {
    const res = await node_fetch(tour_reserve_route, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { authorization, 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(400);

    const json_res = await res.json();
    expect(json_res.status).toBe('fail');
    expect(json_res).toHaveProperty('message');
  }
});

test(`POST ${unauth_tour_reserve_route} should not allow changes and fail with status 403 unauthorized`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(unauth_tour_reserve_route, {
    method: 'POST',
    body: JSON.stringify({ tatami_number: 1 }),
    headers: { authorization, 'Content-Type': 'application/json' },
  });
  expect(res.status).toBe(403);

  const json_res = await res.json();
  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});
