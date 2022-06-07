import { Competition, Tournament, User } from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { app } from '../src/bootstrap';
import node_fetch from 'node-fetch';
import { Server } from 'http';
import { TournamentInterface } from '../src/schemas/Tournament';

let server: Server;

const competition_id = new mongoose.Types.ObjectId();
const user_id_1 = new mongoose.Types.ObjectId();
const competition_slug = 'gara-lavis';

const competition_slug_route = `http://localhost:2500/api/v2/competitions/find/${competition_slug}`;
const invalid_slug_route = 'http://localhost:2500/api/v2/competitions/find/invalid-slug';
const competition_tournaments_route = 'http://localhost:2500/api/v2/competitions';

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
  const res = await node_fetch(competition_slug_route, {
    method: 'GET'
  });
  expect(res.status).toBe(200);
  const json_res = await res.json();
  expect(json_res.status).toBe('success');
});

test(`GET ${invalid_slug_route} should fail with status 404 not found`, async () => {
  const res = await node_fetch(invalid_slug_route, {
    method: 'GET'
  });
  expect(res.status).toBe(404);
  const json_res = await res.json();
  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`GET ${competition_tournaments_route}/:competition_id/tournaments should return the tournaments for the competition`, async () => {
  const tournament_id_1 = new mongoose.Types.ObjectId();
  const tournament_id_2 = new mongoose.Types.ObjectId();
  const other_competition_id = new mongoose.Types.ObjectId();

  const tournaments: TournamentInterface[] = [
    {
      _id: tournament_id_1,
      competition: competition_id,
      category: new mongoose.Types.ObjectId(),
      tatami_number: null,
      finished: false,
      athletes: [],
      winners_bracket: [],
      recovered_bracket_1: [],
      recovered_bracket_2: [],
    },
    {
      _id: tournament_id_2,
      competition: other_competition_id,
      category: new mongoose.Types.ObjectId(),
      tatami_number: null,
      finished: false,
      athletes: [],
      winners_bracket: [],
      recovered_bracket_1: [],
      recovered_bracket_2: [],
    }
  ];

  await Tournament.deleteMany({});
  await Tournament.insertMany(tournaments);

  const res = await node_fetch(`${competition_tournaments_route}/${competition_id.toString()}/tournaments`, {
    method: 'GET'
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: [
      {
        __v: 0,
        _id: tournament_id_1.toString(),
        athletes: [],
        category: null,
        competition: competition_id.toString(),
        finished: false,
        recovered_bracket_1: [],
        recovered_bracket_2: [],
        tatami_number: null,
        winners_bracket: [],
      },
    ],
    status: 'success',
  });
});

test(`GET ${competition_tournaments_route}/:competition_id/tournaments should fail with status 404 not found if the id is valid, but not on the db`, async () => {
  const non_existent_competition_id = new mongoose.Types.ObjectId();

  const res = await node_fetch(`${competition_tournaments_route}/${non_existent_competition_id.toString()}/tournaments`, {
    method: 'GET'
  });

  expect(res.status).toBe(404);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Competizione non trovata',
    status: 'fail',
  });
});

test(`GET ${competition_tournaments_route}/:competition_id/tournaments should fail with status 400 bad request if the id is not valid`, async () => {
  const invalid_competition_id = 'Invalid mongodb id';

  const res = await node_fetch(`${competition_tournaments_route}/${invalid_competition_id.toString()}/tournaments`, {
    method: 'GET'
  });

  expect(res.status).toBe(400);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Id competizione non valido',
    status: 'fail',
  });
});
