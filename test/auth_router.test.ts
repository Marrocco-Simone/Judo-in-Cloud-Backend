import jwt from 'jsonwebtoken';
import { Competition, User } from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { app } = require('../src/bootstrap');
const node_fetch = require('node-fetch');

let server;
const auth_route = 'http://localhost:2500/api/v1/auth';

const user_id_1 = new mongoose.Types.ObjectId();
const competition_id = new mongoose.Types.ObjectId();

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
});

afterAll(async () => {
  await mongoose.disconnect();

  server.close();
});

test(`GET ${auth_route} should give back unauthorized error if there is no jwt`, async () => {
  const res = await node_fetch(auth_route);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`GET ${auth_route} should give back unauthorized error if the jwt is linked to a non-existing user`, async () => {
  const user_id_2 = new mongoose.Types.ObjectId();

  const invalid_user = { _id: user_id_2, username: 'invalidUser' };
  const access_jwt = jwt.sign(invalid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(auth_route, {
    headers: {
      authorization: access_token
    }
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`GET ${auth_route} should give back the user associated to the jwt if valid and populate the competition property`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(auth_route, {
    headers: {
      authorization: access_token
    }
  });

  const json_res = await res.json();

  delete json_res.data.password;

  expect(json_res).toEqual({
    status: 'success',
    data: {
      __v: 0,
      _id: user_id_1.toString(),
      competition: {
        __v: 0,
        _id: competition_id.toString(),
        name: 'competition'
      },
      username: 'validUser'
    }
  });
});

test(`POST ${auth_route} should give an error message if there is no username or password inside the body`, async () => {
  const res = await node_fetch(auth_route, {
    method: 'POST'
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Inserisci username e password',
    status: 'fail'
  });
});

test(`POST ${auth_route} should give an error message if there is no user matching the username inside the body`, async () => {
  const req_body = {
    username: 'invalidUser',
    password: 'pwd'
  };

  const res = await node_fetch(auth_route, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Nome utente o password non validi',
    status: 'fail'
  });
});

test(`POST ${auth_route} should give an error message if the password inside the body is wrong`, async () => {
  const req_body = {
    username: 'validUser',
    password: 'wrongPwd'
  };

  const res = await node_fetch(auth_route, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Nome utente o password non validi',
    status: 'fail'
  });
});

test(`POST ${auth_route} should correctly log in a user, given valid username and password inside the body`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });

  const req_body = {
    username: 'validUser',
    password: 'pwd'
  };

  const res = await node_fetch(auth_route, {
    method: 'POST',
    body: JSON.stringify(req_body),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const json_res = await res.json();

  delete json_res.data.user.password;

  expect(json_res).toEqual({
    data: {
      access_token: access_jwt,
      user: {
        __v: 0,
        _id: user_id_1.toString(),
        competition: competition_id.toString(),
        username: 'validUser'
      }
    },
    status: 'success'
  });
});
