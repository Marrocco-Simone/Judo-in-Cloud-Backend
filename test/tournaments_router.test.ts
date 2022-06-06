import { Category, Competition, Tournament, User } from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { app } = require('../src/bootstrap');
const node_fetch = require('node-fetch');

const tournament_id = new mongoose.Types.ObjectId();
const competition_id = new mongoose.Types.ObjectId();
const category_id = new mongoose.Types.ObjectId();
const user_id_1 = new mongoose.Types.ObjectId();

const tournament_route = `http://localhost:2500/api/v2/tournaments/${tournament_id}`;

let server;

beforeAll(async () => {
  mongoose.connect(process.env.MONGO_URL_TEST);
  server = app.listen(2500);
});

beforeEach(async () => {
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
