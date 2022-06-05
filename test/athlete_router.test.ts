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

const unauth_competition_id = new mongoose.Types.ObjectId();
const unauth_athlete_id = new mongoose.Types.ObjectId();
const unauth_category_id = new mongoose.Types.ObjectId();

const athlete_1_route = `http://localhost:2500/api/v2/athletes/${athlete_id_1}`;
const unauth_athlete_route = `http://localhost:2500/api/v2/athletes/${unauth_athlete_id}`;
const nonexistent_athlete_route = `http://localhost:2500/api/v2/athletes/${new mongoose.Types.ObjectId()}`;
const invalid_athlete_route = 'http://localhost:2500/api/v2/athletes/123';

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
  },
  { // belongs to some other competition
    _id: unauth_athlete_id,
    name: 'Teresa',
    surname: 'Gialli',
    competition: unauth_competition_id,
    club: 'Judo Verona',
    gender: 'F',
    weight: 41,
    birth_year: 2012,
    category: unauth_category_id
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

test(`POST ${athlete_route} should correctly create a new athlete with the right parameters in input`, async () => {
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

test(`PUT ${athlete_1_route} should correctly update the athlete and return the updated model`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const req_body = {
    name: 'Mirco',
    surname: 'Bianchi',
    club: 'Judo Lavis',
    gender: 'M',
    weight: 46,
    birth_year: 2011
  };

  const res = await node_fetch(athlete_1_route, {
    method: 'PUT',
    body: JSON.stringify(req_body),
    headers: {
      'Content-Type': 'application/json',
      authorization
    }
  });
  const json_res = await res.json();
  
  
  
  expect(res.status).toBe(200);

  expect(json_res).toEqual({
    status: 'success',
    data: {
      _id: athlete_id_1.toString(),
      __v: 0,
      name: 'Mirco',
      surname: 'Bianchi',
      club: 'Judo Lavis',
      competition: competition_id.toString(),
      gender: 'M',
      weight: 46,
      birth_year: 2011,
      category: category_id_1.toString(),
    }
  });
});

test(`PUT ${athlete_1_route} with invalid data should should return the fail status`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const invalid_bodies = [
    { gender: 'Z' },
    { weight: 'foo' },
    { year: 'foo' },
  ];

  for (const body of invalid_bodies) {
    const res = await node_fetch(athlete_1_route, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        authorization
      }
    });

    const json_res = await res.json();

    expect(json_res).toHaveProperty('message');
    expect(json_res.status).toBe('fail');
    expect(res.status).toBe(400);
  }
});

test(`PUT ${unauth_athlete_route} should fail and return the unauthorized status`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const req_body = {
    name: 'Teresina',
  };

  const res = await node_fetch(unauth_athlete_route, {
    method: 'PUT',
    body: JSON.stringify(req_body),
    headers: {
      'Content-Type': 'application/json',
      authorization
    }
  });
  const json_res = await res.json();
  expect(res.status).toBe(403);

  

  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`PUT ${nonexistent_athlete_route} should fail and return the not found status`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const req_body = {
    name: 'Foobar',
  };

  const res = await node_fetch(nonexistent_athlete_route, {
    method: 'PUT',
    body: JSON.stringify(req_body),
    headers: {
      'Content-Type': 'application/json',
      authorization
    }
  });

  expect(res.status).toBe(404);

  const json_res = await res.json();

  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`PUT ${invalid_athlete_route} should fail and return the bad request status`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const req_body = {
    name: 'Foobar',
  };

  const res = await node_fetch(invalid_athlete_route, {
    method: 'PUT',
    body: JSON.stringify(req_body),
    headers: {
      'Content-Type': 'application/json',
      authorization
    }
  });

  const json_res = await res.json();
  expect(res.status).toBe(400);

  

  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`PUT ${athlete_1_route} should fail since the age class is closed and return the bad request status`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  // close the age class
  await AgeClass.findByIdAndUpdate(age_class_id_1, { closed: true });

  const req_body = {
    name: 'Mirco',
    surname: 'testi',
    weight: 49,
  };

  const res = await node_fetch(athlete_1_route, {
    method: 'PUT',
    body: JSON.stringify(req_body),
    headers: {
      'Content-Type': 'application/json',
      authorization
    }
  });
  const json_res = await res.json();
  expect(res.status).toBe(400);
  
  


  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`DELETE ${athlete_1_route} should succeed`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(athlete_1_route, {
    method: 'DELETE',
    headers: { authorization }
  });

  const json_res = await res.json();

  expect(res.status).toBe(200);

  // check that it was actually deleted
  const athlete = await Athlete.findById(athlete_id_1);
  expect(athlete).toBeNull();
});

test(`DELETE ${unauth_athlete_route} should fail with status 403 unauthorized`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(unauth_athlete_route, {
    method: 'DELETE',
    headers: { authorization }
  });
  const json_res = await res.json();
  expect(res.status).toBe(403);

  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`DELETE ${nonexistent_athlete_route} should fail with status 404 not found`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(nonexistent_athlete_route, {
    method: 'DELETE',
    headers: { authorization }
  });

  expect(res.status).toBe(404);

  const json_res = await res.json();

  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`DELETE ${invalid_athlete_route} should fail with status 400 bad request`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  const res = await node_fetch(invalid_athlete_route, {
    method: 'DELETE',
    headers: { authorization }
  });

  expect(res.status).toBe(400);

  const json_res = await res.json();

  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});

test(`DELETE ${athlete_1_route} should fail with status 400 since the age class has been closed`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const authorization = `Bearer ${access_jwt}`;

  // close the age class
  await AgeClass.findByIdAndUpdate(age_class_id_1, { closed: true });

  const res = await node_fetch(athlete_1_route, {
    method: 'DELETE',
    headers: { authorization }
  });

  expect(res.status).toBe(400);

  const json_res = await res.json();

  expect(json_res.status).toBe('fail');
  expect(json_res).toHaveProperty('message');
});
