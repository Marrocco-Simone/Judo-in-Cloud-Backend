import jwt from 'jsonwebtoken';
import { Athlete, Category, Competition, Match, Tournament, User } from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { app } from '../src/bootstrap';
import node_fetch from 'node-fetch';
import { Server } from 'http';

let server: Server;

const user_id_1 = new mongoose.Types.ObjectId();
const competition_id = new mongoose.Types.ObjectId();
const other_competition_id = new mongoose.Types.ObjectId();
const tournament_id = new mongoose.Types.ObjectId();
const category_id = new mongoose.Types.ObjectId();
const unauth_tournament_id = new mongoose.Types.ObjectId();
const finished_tournament_id = new mongoose.Types.ObjectId();

const final_match_id = new mongoose.Types.ObjectId();
const rec_final_match_id_1 = new mongoose.Types.ObjectId();
const rec_final_match_id_2 = new mongoose.Types.ObjectId();

const player_first = new mongoose.Types.ObjectId();
const player_second = new mongoose.Types.ObjectId();
const player_third_1 = new mongoose.Types.ObjectId();
const player_third_2 = new mongoose.Types.ObjectId();
const player_fifth_1 = new mongoose.Types.ObjectId();
const player_fifth_2 = new mongoose.Types.ObjectId();

const all_tournaments_route = 'http://localhost:2500/api/v2/tournaments/';
const info_route = `http://localhost:2500/api/v2/tournaments/${tournament_id}`;
const invalid_info_route = 'http://localhost:2500/api/v2/tournaments/123';
const non_existent_info_route = `http://localhost:2500/api/v2/tournaments/${new mongoose.Types.ObjectId()}`;
const tour_reserve_route = `http://localhost:2500/api/v2/tournaments/reserve/${tournament_id}`;
const non_existent_tour_reserve_route = `http://localhost:2500/api/v2/tournaments/reserve/${new mongoose.Types.ObjectId()}`;
const invalid_tour_reserve_route = 'http://localhost:2500/api/v2/tournaments/reserve/123';
const unauth_tour_reserve_route = `http://localhost:2500/api/v2/tournaments/reserve/${unauth_tournament_id}`;
const unfinished_leaderboard_route = `http://localhost:2500/api/v2/tournaments/${tournament_id}/leaderboard`;
const leaderboard_route = `http://localhost:2500/api/v2/tournaments/${finished_tournament_id}/leaderboard`;
const invalid_leaderboard_route = 'http://localhost:2500/api/v2/tournaments/123/leaderboard';
const non_existent_leaderboard_route = `http://localhost:2500/api/v2/tournaments/${new mongoose.Types.ObjectId()}/leaderboard`;
const matches_route = `http://localhost:2500/api/v2/tournaments/${finished_tournament_id}/matches`;
const invalid_matches_route = 'http://localhost:2500/api/v2/tournaments/123/matches';
const non_existent_matches_route = `http://localhost:2500/api/v2/tournaments/${new mongoose.Types.ObjectId()}/matches`;

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

  const category = new Category({
    _id: category_id,
    age_class: null,
    max_weight: 55,
    gender: 'M'
  });

  await Category.deleteMany({});
  await category.save();

  const matches = [
    new Match({ // final match, first player wins
      _id: final_match_id,
      red_athlete: player_first,
      white_athlete: player_second,
      winner_athlete: player_first
    }),
    new Match({ // 3-5 finals 1, third player wins
      _id: rec_final_match_id_1,
      red_athlete: player_fifth_1,
      white_athlete: player_third_1,
      winner_athlete: player_third_1
    }),
    new Match({ // 3-5 finals 2, third player wins
      _id: rec_final_match_id_2,
      red_athlete: player_third_2,
      white_athlete: player_fifth_2,
      winner_athlete: player_third_2
    }),
  ];
  await Match.deleteMany({});
  await Match.bulkSave(matches);

  const athletes = [
    new Athlete({
      _id: player_first
    }),
    new Athlete({
      _id: player_second
    }),
    new Athlete({
      _id: player_third_1
    }),
    new Athlete({
      _id: player_third_2
    }),
    new Athlete({
      _id: player_fifth_1
    }),
    new Athlete({
      _id: player_fifth_2
    })
  ];

  await Athlete.deleteMany({});
  await Athlete.bulkSave(athletes);

  const tournament = new Tournament({
    _id: tournament_id,
    competition: competition_id,
    category: category_id,
    tatami_number: null,
    finished: false,
    athletes: [],
    winners_bracket: [],
    recovered_bracket_1: [],
    recovered_bracket_2: [],
  });
  const unauth_tournament = new Tournament({
    _id: unauth_tournament_id,
    competition: other_competition_id,
    category: new mongoose.Types.ObjectId(),
    tatami_number: null,
    finished: false,
    athletes: [],
    winners_bracket: [],
    recovered_bracket_1: [],
    recovered_bracket_2: [],
  });
  const finished_tournament = new Tournament({
    _id: finished_tournament_id,
    competition: competition_id,
    category: new mongoose.Types.ObjectId(),
    tatami_number: null,
    finished: true,
    athletes: [],
    winners_bracket: [[], [], [matches[0]._id]],
    recovered_bracket_1: [[], [matches[1]._id]],
    recovered_bracket_2: [[], [matches[2]._id]],
  });

  await Tournament.deleteMany({});
  await tournament.save();
  await unauth_tournament.save();
  await finished_tournament.save();
});

afterAll(async () => {
  await mongoose.disconnect();

  server.close();
});

test(`GET ${all_tournaments_route} should return the tournament data for all tournaments`, async () => {
  const res = await node_fetch(all_tournaments_route);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: [
      {
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
        competition: competition_id.toString(),
        finished: false,
        recovered_bracket_1: [],
        recovered_bracket_2: [],
        tatami_number: null,
        winners_bracket: [],
      },
      {
        __v: 0,
        _id: unauth_tournament_id.toString(),
        athletes: [],
        category: null,
        competition: other_competition_id.toString(),
        finished: false,
        recovered_bracket_1: [],
        recovered_bracket_2: [],
        tatami_number: null,
        winners_bracket: [],
      },
      {
        __v: 0,
        _id: finished_tournament_id.toString(),
        athletes: [],
        category: null,
        competition: competition_id.toString(),
        finished: true,
        recovered_bracket_1: [
          [],
          [
            rec_final_match_id_1.toString(),
          ],
        ],
        recovered_bracket_2: [
          [],
          [
            rec_final_match_id_2.toString(),
          ],
        ],
        tatami_number: null,
        winners_bracket: [
          [],
          [],
          [
            final_match_id.toString(),
          ],
        ],
      }
    ],
    status: 'success',
  });
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

test(`GET ${leaderboard_route} should return the final leaderboard`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(leaderboard_route, {
    method: 'GET',
    headers: { authorization },
  });
  const json_res = await res.json();

  expect(res.status).toBe(200);
  expect(json_res.status).toBe('success');

  // check the leaderboard content
  expect(json_res.data).toEqual([
    { place: 1, athlete: player_first.toString() },
    { place: 2, athlete: player_second.toString() },
    { place: 3, athlete: player_third_1.toString() },
    { place: 3, athlete: player_third_2.toString() },
    { place: 5, athlete: player_fifth_1.toString() },
    { place: 5, athlete: player_fifth_2.toString() },
  ]);
});

test(`GET ${unfinished_leaderboard_route} should fail with status 400 since the tournament is not finished`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(unfinished_leaderboard_route, {
    method: 'GET',
    headers: { authorization },
  });
  const json_res = await res.json();

  expect(res.status).toBe(400);
  expect(json_res.status).toBe('fail');
});

test(`GET ${non_existent_leaderboard_route} should fail with status 404 not found since the tournament doesn't exist`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(non_existent_leaderboard_route, {
    method: 'GET',
    headers: { authorization },
  });
  const json_res = await res.json();

  expect(res.status).toBe(404);
  expect(json_res.status).toBe('fail');
});

test(`GET ${invalid_leaderboard_route} should fail with status 400 since the id is not valid`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(invalid_leaderboard_route, {
    method: 'GET',
    headers: { authorization },
  });
  const json_res = await res.json();

  expect(res.status).toBe(400);
  expect(json_res.status).toBe('fail');
});

test(`GET ${info_route} should return the tournament data`, async () => {
  const res = await node_fetch(info_route);

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
        name: 'competition'
      },
      finished: false,
      recovered_bracket_1: [],
      recovered_bracket_2: [],
      tatami_number: null,
      winners_bracket: [],
    },
    status: 'success',
  });
});

test(`GET ${invalid_info_route} with invalid id should return 400 status bad request`, async () => {
  const res = await node_fetch(invalid_info_route, {
    method: 'GET'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    status: 'fail',
    message: 'Id torneo non valido'
  });
});

test(`GET ${non_existent_info_route} with unexisting id should return 404 status not found`, async () => {
  const res = await node_fetch(non_existent_info_route, {
    method: 'GET'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    status: 'fail',
    message: 'Torneo non trovato'
  });
});

test(`GET ${matches_route} should return the matches correctly for a tournament that's not finished`, async () => {
  // set the finished tournament as not finished so that we can see the matches
  await Tournament.updateOne({ _id: finished_tournament_id }, { $set: { finished: false } });

  const res = await node_fetch(matches_route, {
    method: 'GET'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: [
      {
        _id: rec_final_match_id_1.toString(),
        red_athlete: {
          _id: player_fifth_1.toString()
        },
        white_athlete: {
          _id: player_third_1.toString()
        },
        winner_athlete: {
          _id: player_third_1.toString()
        },
      },
      {
        _id: rec_final_match_id_2.toString(),
        red_athlete: {
          _id: player_third_2.toString()
        },
        white_athlete: {
          _id: player_fifth_2.toString()
        },
        winner_athlete: {
          _id: player_third_2.toString()
        },
      },
      {
        _id: final_match_id.toString(),
        red_athlete: {
          _id: player_first.toString()
        },
        white_athlete: {
          _id: player_second.toString()
        },
        winner_athlete: {
          _id: player_first.toString()
        },
      },
    ],
    status: 'success',
  });
});

test(`GET ${matches_route} should return a message if the tournament's finished already`, async () => {
  const res = await node_fetch(matches_route, {
    method: 'GET'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: [],
    status: 'success',
  });
});

test(`GET ${invalid_matches_route} with invalid id should return 400 status bad request`, async () => {
  const res = await node_fetch(invalid_matches_route, {
    method: 'GET'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    status: 'fail',
    message: 'Id torneo non valido'
  });
});

test(`GET ${non_existent_matches_route} with unexisting id should return 404 status not found`, async () => {
  const res = await node_fetch(non_existent_matches_route, {
    method: 'GET'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    status: 'fail',
    message: 'Torneo non trovato'
  });
});
