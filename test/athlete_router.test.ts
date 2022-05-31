import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { AgeClass, Athlete, Category, Competition, Tournament, User } from '../src/schemas';
import { AgeClassInterface } from '../src/schemas/AgeClass';
import { CategoryInterface } from '../src/schemas/Category';
import { AthleteInterface } from '../src/schemas/Athlete';

const { app } = require('../src/bootstrap');
const node_fetch = require('node-fetch');

let server;
const athlete_route = 'http://localhost:2500/api/v1/athletes';

const user_id_1 = new mongoose.Types.ObjectId();
const competition_id = new mongoose.Types.ObjectId();
const age_class_id_1 = new mongoose.Types.ObjectId();
const category_id_1 = new mongoose.Types.ObjectId();
const athlete_id_1 = new mongoose.Types.ObjectId();
const athlete_id_2 = new mongoose.Types.ObjectId();

const age_classes: AgeClassInterface[] = [
  {
    _id: age_class_id_1,
    max_age: 13,
    competition: competition_id,
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
    max_weight: 50,
    gender: 'M',
  }
];
const athletes: AthleteInterface[] = [
  {
    _id: athlete_id_1,
    name: 'Marco',
    surname: 'Rossi',
    competition: competition_id,
    club: 'Judo Bologna',
    gender: 'M',
    weight: 48,
    birth_year: 2010,
    category: category_id_1
  },
  {
    _id: athlete_id_2,
    name: 'Daniele',
    surname: 'Bianchi',
    competition: competition_id,
    club: 'Judo Treviso',
    gender: 'M',
    weight: 47,
    birth_year: 2011,
    category: category_id_1
  }
];

beforeAll(async () => {
  mongoose.connect(process.env.MONGO_URL_TEST);

  server = app.listen(2500);
});

beforeEach(async () => {
  await Competition.remove({});

  const competition = new Competition({
    _id: competition_id,
    name: 'competition'
  });

  await competition.save();

  await User.remove({});

  const hash = await bcrypt.hash('pwd', 10);

  const user_to_save = new User({
    _id: user_id_1,
    username: 'validUser',
    password: hash,
    competition: competition_id
  });

  await user_to_save.save();

  await AgeClass.remove({});
  await AgeClass.insertMany(age_classes);

  await Category.remove({});
  await Category.insertMany(categories);

  await Athlete.remove({});
  await Athlete.insertMany(athletes);

  await Tournament.remove({});
});

afterAll(async () => {
  await mongoose.disconnect();

  server.close();
});

test(`GET ${athlete_route} should give back unauthorized error if there is no jwt`, async () => {
  const res = await node_fetch(athlete_route);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`GET ${athlete_route} should give back all the athletes with a valid jwt`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(athlete_route, {
    headers: {
      authorization: access_token
    }
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    data: [
      {
        __v: 0,
        _id: athlete_id_1.toString(),
        birth_year: 2010,
        category: category_id_1.toString(),
        club: 'Judo Bologna',
        competition: competition_id.toString(),
        gender: 'M',
        name: 'Marco',
        surname: 'Rossi',
        weight: 48,
      },
      {
        __v: 0,
        _id: athlete_id_2.toString(),
        birth_year: 2011,
        category: category_id_1.toString(),
        club: 'Judo Treviso',
        competition: competition_id.toString(),
        gender: 'M',
        name: 'Daniele',
        surname: 'Bianchi',
        weight: 47,
      }
    ],
    status: 'success'
  });
});

test(`POST ${athlete_route} should give back unauthorized error if there is no jwt`, async () => {
  const res = await node_fetch(athlete_route, {
    method: 'POST'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`POST ${athlete_route} should give back an error if the parameters in the body are not of a valid type`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const req_body = {
    name: 'Arturo',
    surname: 'De Rosa',
    competition: competition_id.toString(),
    club: ['Judo Trieste', 'Judo Firenze'],
    gender: 'M',
    weight: 48,
    birth_year: 2013
  };

  const res = await node_fetch(athlete_route, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      authorization: access_token,
      'Content-Type': 'application/json'
    }
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Athlete validation failed: club: Cast to string failed for value "[ \'Judo Trieste\', \'Judo Firenze\' ]" (type Array) at path "club"',
    status: 'error'
  });
});

test(`POST ${athlete_route} should give back an error if the parameters in the body are not enough`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const req_body = {
    name: 'Arturo',
    surname: 'De Rosa',
    competition: competition_id.toString(),
    gender: 'M',
    weight: 48,
    birth_year: 2012
  };

  const res = await node_fetch(athlete_route, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      authorization: access_token,
      'Content-Type': 'application/json'
    }
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Campi Incompleti',
    status: 'fail'
  });
});

test(`POST ${athlete_route} should give correctly create a new athlete with the right parameters in input`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const req_body = {
    name: 'Arturo',
    surname: 'De Rosa',
    club: 'Judo Firenze',
    competition: competition_id.toString(),
    gender: 'M',
    weight: 48,
    birth_year: 2012
  };

  const res = await node_fetch(athlete_route, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      'Content-Type': 'application/json',
      authorization: access_token
    }
  });

  const json_res = await res.json();

  expect(json_res.data).toHaveProperty('_id');

  // automatically generated id, not retrievable
  delete json_res.data._id;

  expect(json_res).toEqual({
    data: {
      __v: 0,
      name: 'Arturo',
      surname: 'De Rosa',
      club: 'Judo Firenze',
      category: category_id_1.toString(),
      competition: competition_id.toString(),
      gender: 'M',
      weight: 48,
      birth_year: 2012
    },
    status: 'success'
  });
});
