import jwt from 'jsonwebtoken';
import { AgeClass, Athlete, Category, Competition, Tournament, User, Match } from '../src/schemas';
import mongoose from 'mongoose';
import { AgeClassInterface } from '../src/schemas/AgeClass';
import { CategoryInterface } from '../src/schemas/Category';
import { AthleteInterface } from '../src/schemas/Athlete';
import { MatchInterface } from '../src/schemas/Match';
import { UserInterface } from '../src/schemas/User';
import { CompetitionInterface } from '../src/schemas/Competition';

const { app } = require('../src/bootstrap');
const node_fetch = require('node-fetch');

let server;
const age_class_route_v1 = 'http://localhost:2500/api/v1/age_classes';
const age_class_route_v2 = 'http://localhost:2500/api/v2/age_classes';

const user_id_1 = new mongoose.Types.ObjectId();
const user_id_2 = new mongoose.Types.ObjectId();
const competition_id_1 = new mongoose.Types.ObjectId();
const competition_id_2 = new mongoose.Types.ObjectId();
const age_class_id_1 = new mongoose.Types.ObjectId();
const age_class_id_2 = new mongoose.Types.ObjectId();
const category_id_1 = new mongoose.Types.ObjectId();
const category_id_2 = new mongoose.Types.ObjectId();
const category_id_3 = new mongoose.Types.ObjectId();
const category_id_4 = new mongoose.Types.ObjectId();
const category_id_5 = new mongoose.Types.ObjectId();
const athlete_id_1 = new mongoose.Types.ObjectId();
const athlete_id_2 = new mongoose.Types.ObjectId();
const athlete_id_3 = new mongoose.Types.ObjectId();
const athlete_id_4 = new mongoose.Types.ObjectId();

const age_classes: AgeClassInterface[] = [
  {
    _id: age_class_id_1,
    max_age: 15,
    competition: competition_id_1,
    name: 'Giovanissimi',
    closed: false,
    params: {
      match_time: 10,
      supplemental_match_time: 2,
      ippon_to_win: 1,
      wazaari_to_win: 3,
      ippon_timer: 10,
      wazaari_timer: 5
    }
  },
  {
    _id: age_class_id_2,
    max_age: 13,
    competition: competition_id_1,
    name: 'Esordienti',
    closed: false,
    params: {
      match_time: 5,
      supplemental_match_time: 1,
      ippon_to_win: 1,
      wazaari_to_win: 2,
      ippon_timer: 7,
      wazaari_timer: 5
    }
  }
];
const categories: CategoryInterface[] = [
  {
    _id: category_id_1,
    age_class: age_class_id_1,
    max_weight: 60,
    gender: 'M'
  },
  {
    _id: category_id_2,
    age_class: age_class_id_2,
    max_weight: 50,
    gender: 'M'
  },
  {
    _id: category_id_3,
    age_class: age_class_id_1,
    max_weight: 55,
    gender: 'F'
  },
  {
    _id: category_id_4,
    age_class: age_class_id_1,
    max_weight: 50,
    gender: 'M'
  },
  {
    _id: category_id_5,
    age_class: age_class_id_2,
    max_weight: 50,
    gender: 'F'
  }
];
const athletes: AthleteInterface[] = [
  {
    _id: athlete_id_1,
    name: 'Marco',
    surname: 'Rossi',
    competition: competition_id_1,
    club: 'Judo Bologna',
    gender: 'M',
    weight: 48,
    birth_year: 2010,
    category: category_id_2
  },
  {
    _id: athlete_id_2,
    name: 'Daniele',
    surname: 'Bianchi',
    competition: competition_id_1,
    club: 'Judo Treviso',
    gender: 'M',
    weight: 47,
    birth_year: 2011,
    category: category_id_2
  },
  {
    _id: athlete_id_3,
    name: 'Kenny',
    surname: 'Rosa',
    competition: competition_id_1,
    club: 'Judo Milano',
    gender: 'M',
    weight: 46,
    birth_year: 2011,
    category: category_id_2
  },
  {
    _id: athlete_id_4,
    name: 'Davide',
    surname: 'Bruni',
    competition: competition_id_1,
    club: 'Judo Trento',
    gender: 'M',
    weight: 48,
    birth_year: 2010,
    category: category_id_2
  }
];
const users: UserInterface[] = [
  {
    _id: user_id_1,
    username: 'validUser',
    password: 'pwd',
    competition: competition_id_1
  },
  {
    _id: user_id_2,
    username: 'validUserForSecondCompetition',
    password: 'pwd2',
    competition: competition_id_2
  }
];
const competitions: CompetitionInterface[] = [
  {
    _id: competition_id_1,
    name: 'competition',
    slug: 'comp'
  },
  {
    _id: competition_id_2,
    name: 'other_competition',
    slug: 'other_comp'
  }
];

beforeAll(async () => {
  mongoose.connect(process.env.MONGO_URL_TEST);

  server = app.listen(2500);
});

beforeEach(async () => {
  await Competition.remove({});
  await Competition.insertMany(competitions);

  await User.remove({});
  await User.insertMany(users);

  await AgeClass.remove({});
  await AgeClass.insertMany(age_classes);

  await Category.remove({});
  await Category.insertMany(categories);

  await Athlete.remove({});
  await Athlete.insertMany(athletes);

  await Tournament.remove({});

  await Match.remove({});
});

afterAll(async () => {
  await mongoose.disconnect();

  server.close();
});

test(`GET ${age_class_route_v1} should give back unauthorized error if there is no jwt`, async () => {
  const res = await node_fetch(age_class_route_v1);

  expect(res.status).toBe(401);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`GET ${age_class_route_v1} should give back all the age classes with a valid jwt, and fill all the category information inside the array`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(age_class_route_v1, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: [
      {
        __v: 0,
        _id: age_class_id_1.toString(),
        categories: [
          {
            __v: 0,
            _id: category_id_1.toString(),
            age_class: age_class_id_1.toString(),
            max_weight: '60',
            gender: 'M',
          },
          {
            __v: 0,
            _id: category_id_3.toString(),
            age_class: age_class_id_1.toString(),
            max_weight: '55',
            gender: 'F',
          },
          {
            __v: 0,
            _id: category_id_4.toString(),
            age_class: age_class_id_1.toString(),
            max_weight: '50',
            gender: 'M',
          }
        ],
        closed: false,
        competition: competition_id_1.toString(),
        max_age: 15,
        name: 'Giovanissimi',
        params: {
          match_time: 10,
          supplemental_match_time: 2,
          ippon_to_win: 1,
          wazaari_to_win: 3,
          ippon_timer: 10,
          wazaari_timer: 5
        }
      },
      {
        __v: 0,
        _id: age_class_id_2.toString(),
        categories: [
          {
            __v: 0,
            _id: category_id_2.toString(),
            age_class: age_class_id_2.toString(),
            max_weight: '50',
            gender: 'M',
          },
          {
            __v: 0,
            _id: category_id_5.toString(),
            age_class: age_class_id_2.toString(),
            max_weight: '50',
            gender: 'F'
          }
        ],
        closed: false,
        competition: competition_id_1.toString(),
        max_age: 13,
        name: 'Esordienti',
        params: {
          match_time: 5,
          supplemental_match_time: 1,
          ippon_to_win: 1,
          wazaari_to_win: 2,
          ippon_timer: 7,
          wazaari_timer: 5
        }
      }
    ],
    status: 'success'
  });
});

test(`GET ${age_class_route_v1}/:age_class_id should give back unauthorized error if there is no jwt`, async () => {
  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_1.toString()}`);

  expect(res.status).toBe(401);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`GET ${age_class_route_v1}/:age_class_id should give back an error if there is no age_class linked to the id in the url`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const age_class_id_3 = new mongoose.Types.ObjectId();

  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_3.toString()}`, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(404);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Classe d\'età non trovata',
    status: 'fail'
  });
});

test(`GET ${age_class_route_v1}/:age_class_id should give back an error if the age_class linked in the url is not a valid id`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const age_class_id_3 = 'an invalid mongodb id';

  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_3}`, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(400);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Id della classe d\'età non valido',
    status: 'fail'
  });
});

test(`GET ${age_class_route_v1}/:age_class_id should give back the specific age class with a valid jwt`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_1.toString()}`, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: {
      __v: 0,
      _id: age_class_id_1.toString(),
      closed: false,
      competition: competition_id_1.toString(),
      max_age: 15,
      name: 'Giovanissimi',
      params: {
        match_time: 10,
        supplemental_match_time: 2,
        ippon_to_win: 1,
        wazaari_to_win: 3,
        ippon_timer: 10,
        wazaari_timer: 5
      }
    },
    status: 'success'
  });
});

test(`POST ${age_class_route_v1}/:age_class_id should give back unauthorized error if there is no jwt`, async () => {
  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_1.toString()}`, {
    method: 'POST'
  });

  expect(res.status).toBe(401);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`POST ${age_class_route_v1}/:age_class_id should give back an error if there is no age_class linked to the id in the url`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const age_class_id_3 = new mongoose.Types.ObjectId();

  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_3.toString()}`, {
    method: 'POST',
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(404);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Classe d\'età non trovata',
    status: 'fail'
  });
});

test(`POST ${age_class_route_v1}/:age_class_id should give back an error if the age_class linked in the url is not a valid id`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const age_class_id_3 = 'an invalid mongodb id';

  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_3}`, {
    method: 'POST',
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(400);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Id della classe d\'età non valido',
    status: 'fail'
  });
});

test(`POST ${age_class_route_v1}/:age_class_id should give back an error if the parameters in the body are not of a valid type`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const req_body = {
    params: {
      match_time: '10 minutes',
      supplemental_match_time: '2 minutes',
      ippon_to_win: '1 ippon',
      wazaari_to_win: '4 wazaaris',
      ippon_timer: '10 seconds',
      wazaari_timer: '6 seconds'
    }
  };

  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_1.toString()}`, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      authorization: access_token,
      'Content-Type': 'application/json'
    }
  });

  expect(res.status).toBe(500);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'AgeClass validation failed: params.match_time: Cast to Number failed for value "10 minutes" (type string) at path "params.match_time", params.supplemental_match_time: Cast to Number failed for value "2 minutes" (type string) at path "params.supplemental_match_time", params.ippon_to_win: Cast to Number failed for value "1 ippon" (type string) at path "params.ippon_to_win", params.wazaari_to_win: Cast to Number failed for value "4 wazaaris" (type string) at path "params.wazaari_to_win", params.ippon_timer: Cast to Number failed for value "10 seconds" (type string) at path "params.ippon_timer", params.wazaari_timer: Cast to Number failed for value "6 seconds" (type string) at path "params.wazaari_timer"',
    status: 'error'
  });
});

test(`POST ${age_class_route_v1}/:age_class_id should give back an error if the parameters in the body are not enough`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const req_body = {
    params: {
      match_time: 10,
      supplemental_match_time: 2,
      ippon_to_win: 1,
      wazaari_to_win: 4
    }
  };

  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_1.toString()}`, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      authorization: access_token,
      'Content-Type': 'application/json'
    }
  });

  expect(res.status).toBe(400);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Campi incompleti',
    status: 'fail'
  });
});

test(`POST ${age_class_route_v1}/:age_class_id should update the age class with the parameters in the body, if they are of valid type`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const req_body = {
    params: {
      match_time: 10,
      supplemental_match_time: 2,
      ippon_to_win: 1,
      wazaari_to_win: 4,
      ippon_timer: 10,
      wazaari_timer: 6
    }
  };

  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_1.toString()}`, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      authorization: access_token,
      'Content-Type': 'application/json'
    }
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: {
      __v: 0,
      _id: age_class_id_1.toString(),
      closed: false,
      competition: competition_id_1.toString(),
      max_age: 15,
      name: 'Giovanissimi',
      params: {
        match_time: 10,
        supplemental_match_time: 2,
        ippon_to_win: 1,
        wazaari_to_win: 4,
        ippon_timer: 10,
        wazaari_timer: 6
      }
    },
    status: 'success'
  });
});

test(`POST ${age_class_route_v1}/:age_class_id should close the age class with the flag in the body, create a new tournament`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const req_body = {
    closed: true
  };

  const res = await node_fetch(`${age_class_route_v1}/${age_class_id_2.toString()}`, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      authorization: access_token,
      'Content-Type': 'application/json'
    }
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: {
      __v: 0,
      _id: age_class_id_2.toString(),
      closed: true,
      competition: competition_id_1.toString(),
      max_age: 13,
      name: 'Esordienti',
      params: {
        match_time: 5,
        supplemental_match_time: 1,
        ippon_to_win: 1,
        wazaari_to_win: 2,
        ippon_timer: 7,
        wazaari_timer: 5
      }
    },
    status: 'success'
  });

  expect(await Tournament.count({})).toBe(1);

  const tournament = await (await Tournament.findOne({})).toJSON();

  expect(tournament).toHaveProperty('_id');
  expect(tournament).toHaveProperty('winners_bracket');

  // remove information that we cannot retrieve, ids generated automatically
  delete tournament._id;
  delete tournament.winners_bracket;

  expect(tournament).toEqual({
    __v: 1,
    athletes: [
      athlete_id_1,
      athlete_id_2,
      athlete_id_3,
      athlete_id_4,
    ],
    category: category_id_2,
    competition: competition_id_1,
    finished: false,
    recovered_bracket_1: [],
    recovered_bracket_2: [],
    tatami_number: 0
  });
});

test(`GET ${age_class_route_v2}/reopen/:age_class_id should give back unauthorized error if there is no jwt`, async () => {
  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_1.toString()}`);

  expect(res.status).toBe(401);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`GET ${age_class_route_v2}/reopen/:age_class_id should give back an error if there is no age_class linked to the id in the url`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const age_class_id_3 = new mongoose.Types.ObjectId();

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_3.toString()}`, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(404);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Classe d\'età non trovata',
    status: 'fail'
  });
});

test(`GET ${age_class_route_v2}/reopen/:age_class_id should give back an error if the age_class linked in the url is not a valid id`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const age_class_id_3 = 'an invalid mongodb id';

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_3}`, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(400);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Id della classe d\'età non valido',
    status: 'fail'
  });
});

test(`GET ${age_class_route_v2}/reopen/:age_class_id should give back an error if the authenticated user is in another competition from the one of the age class`, async () => {
  const valid_user = { _id: user_id_2, username: 'validUserForSecondCompetition' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_2.toString()}`, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(403);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'L\'utente è registrato per un\'altra gara',
    status: 'fail'
  });
});

test(`GET ${age_class_route_v2}/reopen/:age_class_id should return can_reopen = true if the age_class is not closed`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_1.toString()}`, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: {
      can_reopen: true
    },
    status: 'success'
  });
});

test(`GET ${age_class_route_v2}/reopen/:age_class_id should return can_reopen = false if at least one match has been started on the age_class`, async () => {
  const match_id_1 = new mongoose.Types.ObjectId();
  const match_id_2 = new mongoose.Types.ObjectId();
  const tournament_id = new mongoose.Types.ObjectId();

  const matches: MatchInterface[] = [
    {
      _id: match_id_1,
      white_athlete: athlete_id_1,
      red_athlete: athlete_id_4,
      winner_athlete: athlete_id_4,
      tournament: tournament_id,
      is_started: true,
      is_over: true,
      match_type: 1,
      loser_recovered: false,
      match_scores: {
        final_time: 5,
        white_ippon: 0,
        white_wazaari: 1,
        white_penalties: 2,
        red_ippon: 1,
        red_wazaari: 0,
        red_penalties: 0
      },
    },
    {
      _id: match_id_2,
      white_athlete: athlete_id_2,
      red_athlete: athlete_id_3,
      winner_athlete: null,
      tournament: tournament_id,
      is_started: false,
      is_over: false,
      match_type: 1,
      loser_recovered: false,
      match_scores: {
        final_time: null,
        white_ippon: null,
        white_wazaari: null,
        white_penalties: null,
        red_ippon: null,
        red_wazaari: null,
        red_penalties: null
      },
    }
  ];

  await Match.insertMany(matches);

  const tournament = new Tournament({
    _id: tournament_id,
    competition: competition_id_1,
    category: category_id_2,
    tatami_number: 1,
    finished: false,
    athletes: [
      athlete_id_1,
      athlete_id_2,
      athlete_id_3,
      athlete_id_4
    ],
    winners_bracket: [
      [
        match_id_1,
        match_id_2
      ],
      [
        null
      ]
    ],
    recovered_bracket_1: [
      [
        null
      ]
    ],
    recovered_bracket_2: [
      [
        null
      ]
    ]
  });

  await tournament.save();

  await AgeClass.updateOne({ _id: age_class_id_2 }, { $set: { closed: true } });

  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_2.toString()}`, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: {
      can_reopen: false
    },
    status: 'success'
  });
});

test(`GET ${age_class_route_v2}/reopen/:age_class_id should return can_reopen = true if no match has been started on the age_class`, async () => {
  const match_id_1 = new mongoose.Types.ObjectId();
  const match_id_2 = new mongoose.Types.ObjectId();
  const tournament_id = new mongoose.Types.ObjectId();

  const matches: MatchInterface[] = [
    {
      _id: match_id_1,
      white_athlete: athlete_id_1,
      red_athlete: athlete_id_4,
      winner_athlete: null,
      tournament: tournament_id,
      is_started: false,
      is_over: false,
      match_type: 1,
      loser_recovered: false,
      match_scores: {
        final_time: null,
        white_ippon: null,
        white_wazaari: null,
        white_penalties: null,
        red_ippon: null,
        red_wazaari: null,
        red_penalties: null
      },
    },
    {
      _id: match_id_2,
      white_athlete: athlete_id_2,
      red_athlete: athlete_id_3,
      winner_athlete: null,
      tournament: tournament_id,
      is_started: false,
      is_over: false,
      match_type: 1,
      loser_recovered: false,
      match_scores: {
        final_time: null,
        white_ippon: null,
        white_wazaari: null,
        white_penalties: null,
        red_ippon: null,
        red_wazaari: null,
        red_penalties: null
      },
    }
  ];

  await Match.insertMany(matches);

  const tournament = new Tournament({
    _id: tournament_id,
    competition: competition_id_1,
    category: category_id_2,
    tatami_number: 1,
    finished: false,
    athletes: [
      athlete_id_1,
      athlete_id_2,
      athlete_id_3,
      athlete_id_4
    ],
    winners_bracket: [
      [
        match_id_1,
        match_id_2
      ],
      [
        null
      ]
    ],
    recovered_bracket_1: [
      [
        null
      ]
    ],
    recovered_bracket_2: [
      [
        null
      ]
    ]
  });

  await tournament.save();

  await AgeClass.updateOne({ _id: age_class_id_2 }, { $set: { closed: true } });

  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_2.toString()}`, {
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: {
      can_reopen: true
    },
    status: 'success'
  });
});

test(`POST ${age_class_route_v2}/reopen/:age_class_id should give back unauthorized error if there is no jwt`, async () => {
  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_1.toString()}`, {
    method: 'POST'
  });

  expect(res.status).toBe(401);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`POST ${age_class_route_v2}/reopen/:age_class_id should give back an error if there is no age_class linked to the id in the url`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const age_class_id_3 = new mongoose.Types.ObjectId();

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_3.toString()}`, {
    method: 'POST',
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(404);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Classe d\'età non trovata',
    status: 'fail'
  });
});

test(`POST ${age_class_route_v2}/reopen/:age_class_id should give back an error if the age_class linked in the url is not a valid id`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const age_class_id_3 = 'an invalid mongodb id';

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_3}`, {
    method: 'POST',
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(400);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Id della classe d\'età non valido',
    status: 'fail'
  });
});

test(`POST ${age_class_route_v2}/reopen/:age_class_id should give back an error if the authenticated user is in another competition from the one of the age class`, async () => {
  const valid_user = { _id: user_id_2, username: 'validUserForSecondCompetition' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_2.toString()}`, {
    method: 'POST',
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(403);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'L\'utente è registrato per un\'altra gara',
    status: 'fail'
  });
});

test(`POST ${age_class_route_v2}/reopen/:age_class_id should return the age class in input, if it's not closed`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_1.toString()}`, {
    method: 'POST',
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: {
      __v: 0,
      _id: age_class_id_1.toString(),
      closed: false,
      competition: competition_id_1.toString(),
      max_age: 15,
      name: 'Giovanissimi',
      params: {
        ippon_timer: 10,
        ippon_to_win: 1,
        match_time: 10,
        supplemental_match_time: 2,
        wazaari_timer: 5,
        wazaari_to_win: 3
      }
    },
    status: 'success'
  });
});

test(`POST ${age_class_route_v2}/reopen/:age_class_id should return the age class in input, reopen the age class and delete all tournament and matches if the age class is closed`, async () => {
  const match_id_1 = new mongoose.Types.ObjectId();
  const match_id_2 = new mongoose.Types.ObjectId();
  const tournament_id = new mongoose.Types.ObjectId();

  const matches: MatchInterface[] = [
    {
      _id: match_id_1,
      white_athlete: athlete_id_1,
      red_athlete: athlete_id_4,
      winner_athlete: null,
      tournament: tournament_id,
      is_started: false,
      is_over: false,
      match_type: 1,
      loser_recovered: false,
      match_scores: {
        final_time: null,
        white_ippon: null,
        white_wazaari: null,
        white_penalties: null,
        red_ippon: null,
        red_wazaari: null,
        red_penalties: null
      },
    },
    {
      _id: match_id_2,
      white_athlete: athlete_id_2,
      red_athlete: athlete_id_3,
      winner_athlete: null,
      tournament: tournament_id,
      is_started: false,
      is_over: false,
      match_type: 1,
      loser_recovered: false,
      match_scores: {
        final_time: null,
        white_ippon: null,
        white_wazaari: null,
        white_penalties: null,
        red_ippon: null,
        red_wazaari: null,
        red_penalties: null
      },
    }
  ];

  await Match.insertMany(matches);

  const tournament = new Tournament({
    _id: tournament_id,
    competition: competition_id_1,
    category: category_id_2,
    tatami_number: 1,
    finished: false,
    athletes: [
      athlete_id_1,
      athlete_id_2,
      athlete_id_3,
      athlete_id_4
    ],
    winners_bracket: [
      [
        match_id_1,
        match_id_2
      ],
      [
        null
      ]
    ],
    recovered_bracket_1: [
      [
        null
      ]
    ],
    recovered_bracket_2: [
      [
        null
      ]
    ]
  });

  await tournament.save();

  await AgeClass.updateOne({ _id: age_class_id_2 }, { $set: { closed: true } });

  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(`${age_class_route_v2}/reopen/${age_class_id_2.toString()}`, {
    method: 'POST',
    headers: {
      authorization: access_token
    }
  });

  expect(res.status).toBe(200);

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: {
      __v: 0,
      _id: age_class_id_2.toString(),
      closed: false,
      competition: competition_id_1.toString(),
      max_age: 13,
      name: 'Esordienti',
      params: {
        ippon_timer: 7,
        ippon_to_win: 1,
        match_time: 5,
        supplemental_match_time: 1,
        wazaari_timer: 5,
        wazaari_to_win: 2
      }
    },
    status: 'success'
  });

  expect(await Match.count({})).toBe(0);
  expect(await Tournament.count({})).toBe(0);
});
