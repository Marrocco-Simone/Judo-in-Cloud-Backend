import { Category, Competition, Tournament, User } from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { app } = require('../src/bootstrap');
const node_fetch = require('node-fetch');

const tournament_id = new mongoose.Types.ObjectId();
const competition_id = new mongoose.Types.ObjectId();
const category_id = new mongoose.Types.ObjectId();
const user_id_1 = new mongoose.Types.ObjectId();
const tournament_id_unexisting = new mongoose.Types.ObjectId();

const tournament_route = `http://localhost:2500/api/v2/tournaments/${tournament_id}`;
const tournament_route_nonvalidid = 'http://localhost:2500/api/v2/tournaments/123';
const tournament_route_unexisting = `http://localhost:2500/api/v2/tournaments/${tournament_id_unexisting}`;

let server;

beforeAll(async () => {
  mongoose.connect(process.env.MONGO_URL_TEST);
  server = app.listen(2500);
});

beforeEach(async () => {
  await Competition.deleteMany({});
  await Category.deleteMany({});
  await Tournament.deleteMany({});

  const competition = await new Competition({
    _id: competition_id,
    name: 'Gara Lavis',
    slug: 'gara-lavis'

  });

  await competition.save();

  const category = await new Category({
    _id: category_id,
    age_class: null,
    max_weight: 55,
    gender: 'M'
  });

  await category.save();

  const tournament = await new Tournament({
    _id: tournament_id,
    competition: competition_id,
    category: category_id,
    tatami_number: 1,
    finished: false,
    athletes: [],
    winners_bracket: [],
    recovered_bracket_1: [],
    recovered_bracket_2: []
  });

  await tournament.save();

  await User.deleteMany({});

  const hash = await bcrypt.hash('pwd', 10);

  const user_to_save = new User({
    _id: user_id_1,
    username: 'validUser',
    password: hash,
    competition: competition_id
  });
  await user_to_save.save();
});

afterAll(async () => {
  Tournament.deleteMany();
  await mongoose.disconnect();
  server.close();
});

test(`GET ${tournament_route} should return the tournament data`, async () => {
  const res = await node_fetch(tournament_route);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: {
      __v: 0,
      _id: tournament_id.toString(),
      athletes: [],
      category: {
        __v: 0,
        _id: category_id.toString(),
        age_class: null,
        gender: 'M',
        max_weight: '55',
      },
      competition: {
        __v: 0,
        _id: competition_id.toString(),
        name: 'Gara Lavis',
        slug: 'gara-lavis',
      },
      finished: false,
      recovered_bracket_1: [],
      recovered_bracket_2: [],
      tatami_number: 1,
      winners_bracket: [],
    },
    status: 'success',
  });
});

test(`GET ${tournament_route_nonvalidid} with invalid id should return 400 status bad request`, async () => {
  const res = await node_fetch(tournament_route_nonvalidid, {
    method: 'GET'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    status: 'fail',
    message: 'Id torneo non valido'
  });
});

test(`GET ${tournament_route_unexisting} with unexisting id should return 404 status not found`, async () => {
  const res = await node_fetch(tournament_route_unexisting, {
    method: 'GET'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    status: 'fail',
    message: 'Torneo non trovato'
  });
});
