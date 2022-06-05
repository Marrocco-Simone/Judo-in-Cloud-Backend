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

const tour_reserve_route = `http://localhost:2500/api/v2/tournaments/reserve/${tournament_id}`;
const non_existent_tour_reserve_route = `http://localhost:2500/api/v2/tournaments/reserve/${new mongoose.Types.ObjectId()}`;
const invalid_tour_reserve_route = 'http://localhost:2500/api/v2/tournaments/reserve/123';

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
  await Tournament.deleteMany({});
  await tournament.save();
});

afterAll(async () => {
  await mongoose.disconnect();

  server.close();
});

test(`POST ${tour_reserve_route} should reserve the tournament`, async () => {
  const invalid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(invalid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
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
});

test(`POST ${invalid_tour_reserve_route} should fail with status 400 since the id is invalid`, async () => {
});
