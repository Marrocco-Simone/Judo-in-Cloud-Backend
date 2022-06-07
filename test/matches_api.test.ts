import jwt from 'jsonwebtoken';
import {
  AgeClass,
  Athlete,
  Category,
  Competition,
  Match,
  Tournament,
  User,
} from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { app } from '../src/bootstrap';
import node_fetch from 'node-fetch';
import { Server } from 'http';

let server: Server;

const user_id_1 = new mongoose.Types.ObjectId();
const competition_id = new mongoose.Types.ObjectId();
const match_1_id = new mongoose.Types.ObjectId();
const match_2_id = new mongoose.Types.ObjectId();
const athlete_1_id = new mongoose.Types.ObjectId();
const athlete_2_id = new mongoose.Types.ObjectId();
const tournament_id = new mongoose.Types.ObjectId();
const age_class_id = new mongoose.Types.ObjectId();
const category_id = new mongoose.Types.ObjectId();

const match_1_route = `http://localhost:2500/api/v1/matches/${match_1_id}`;
const match_2_route = `http://localhost:2500/api/v1/matches/${match_2_id}`;
const nonexistent_match_route = `http://localhost:2500/api/v1/matches/${new mongoose.Types.ObjectId()}`;

beforeAll(async () => {
  mongoose.connect(process.env.MONGO_URL_TEST);

  server = app.listen(2500);
});

beforeEach(async () => {
  const competition = new Competition({
    _id: competition_id,
    name: 'competition',
  });
  await Competition.deleteMany({});
  await competition.save();

  const user = new User({
    _id: user_id_1,
    username: 'validUser',
    password: await bcrypt.hash('pwd', 10),
    competition: competition_id,
  });
  await User.deleteMany({});
  await user.save();

  const age_class = new AgeClass({
    _id: age_class_id,
    name: 'Esordienti',
  });
  await AgeClass.deleteMany();
  await age_class.save();

  const category = new Category({
    _id: category_id,
    age_class: age_class_id,
    max_weight: 50,
    gender: 'F',
  });
  await Category.deleteMany();
  await category.save();

  const tournament = new Tournament({
    _id: tournament_id,
    category: category_id,
  });
  await Tournament.deleteMany();
  await tournament.save();

  const athlete_1 = new Athlete({
    _id: athlete_1_id,
    name: 'Teresa',
    surname: 'Rossi',
    category: category_id,
  });
  const athlete_2 = new Athlete({
    _id: athlete_2_id,
    name: 'Carla',
    surname: 'Bianchi',
    category: category_id,
  });
  await Athlete.deleteMany({});
  await athlete_1.save();
  await athlete_2.save();

  const match = new Match({
    _id: match_1_id,
    white_athlete: athlete_1._id,
    red_athlete: athlete_2._id,
    winner_athlete: athlete_1._id,
    tournament: tournament_id,
    is_started: false,
    is_over: false,
    match_type: 0,
    loser_recovered: false,
  });
  const match_2 = new Match({
    _id: match_2_id,
    white_athlete: athlete_1._id,
    red_athlete: athlete_2._id,
    winner_athlete: null,
    is_started: false,
    is_over: false,
    match_type: 0,
    loser_recovered: false,
  });
  await Match.deleteMany({});
  await match.save();
  await match_2.save();
});

afterAll(async () => {
  await mongoose.disconnect();

  server.close();
});

test(`GET ${match_1_route} should return the match information`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 3600 * 24,
  });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(match_1_route, {
    headers: { authorization },
    method: 'GET',
  });
  expect(res.status).toBe(200);

  const json_res = await res.json();
  expect(json_res).toEqual({
    status: 'success',
    data: {
      __v: 0,
      _id: match_1_id.toString(),
      category_name: 'Esordienti U50 F',
      is_over: false,
      is_started: false,
      loser_recovered: false,
      match_type: 0,
      params: {},
      red_athlete: {
        __v: 0,
        _id: athlete_2_id.toString(),
        category: category_id.toString(),
        name: 'Carla',
        surname: 'Bianchi',
      },
      tournament: tournament_id.toString(),
      white_athlete: {
        __v: 0,
        _id: athlete_1_id.toString(),
        category: category_id.toString(),
        name: 'Teresa',
        surname: 'Rossi',
      },
      winner_athlete: {
        __v: 0,
        _id: athlete_1_id.toString(),
        category: category_id.toString(),
        name: 'Teresa',
        surname: 'Rossi',
      },
    },
  });
});

test(`GET ${nonexistent_match_route} on non existing match should fail and return 404 not found`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 3600 * 24,
  });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(nonexistent_match_route, {
    headers: { authorization },
    method: 'GET',
  });
  expect(res.status).toBe(404);
});

test(`POST ${match_2_route} should update the match and return the new data`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 3600 * 24,
  });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(match_2_route, {
    headers: { authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      winner_athlete: athlete_2_id.toString(),
      is_started: true,
      is_over: true,
      match_scores: {
        final_time: 6,
        white_ippon: 1,
        white_wazaari: 0,
        white_penalties: 2,
        red_ippon: 0,
        red_wazaari: 1,
        red_penalties: 0
      }
    }),
    method: 'POST',
  });
  expect(res.status).toBe(200);

  const json_res = await res.json();
  expect(json_res).toEqual({
    status: 'success',
    data: {
      __v: 0,
      _id: match_2_id.toString(),
      is_over: true,
      is_started: true,
      loser_recovered: false,
      match_type: 0,
      red_athlete: athlete_2_id.toString(),
      white_athlete: athlete_1_id.toString(),
      winner_athlete: athlete_2_id.toString(),
      match_scores: {
        final_time: 6,
        white_ippon: 1,
        white_wazaari: 0,
        white_penalties: 2,
        red_ippon: 0,
        red_wazaari: 1,
        red_penalties: 0
      }
    },
  });
});

test(`POST ${nonexistent_match_route} on non existing match should fail and return 404 not found`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 3600 * 24,
  });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(nonexistent_match_route, {
    headers: { authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      winner_athlete: athlete_2_id.toString(),
      is_started: true,
      is_over: true,
      match_scores: {
        final_time: 6,
        white_ippon: 1,
        white_wazaari: 0,
        white_penalties: 2,
        red_ippon: 0,
        red_wazaari: 1,
        red_penalties: 0
      }
    }),
    method: 'POST',
  });
  expect(res.status).toBe(404);

  const json_res = await res.json();
  expect(json_res).toEqual({
    message: 'Incontro non trovato',
    status: 'fail'
  });
});

test(`POST ${match_2_route} should fail with values not matching the data model`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 3600 * 24,
  });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(match_2_route, {
    headers: { authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      winner_athlete: athlete_2_id.toString(),
      is_started: true,
      is_over: true,
      match_scores: {
        final_time: '5 minutes and 15 seconds',
        white_ippon: 1,
        white_wazaari: 0,
        white_penalties: 2,
        red_ippon: 0,
        red_wazaari: 1,
        red_penalties: 0
      }
    }),
    method: 'POST',
  });
  expect(res.status).toBe(500);

  const json_res = await res.json();
  expect(json_res).toEqual({
    message: 'Match validation failed: match_scores.final_time: Cast to Number failed for value "5 minutes and 15 seconds" (type string) at path "match_scores.final_time"',
    status: 'error'
  });
});
