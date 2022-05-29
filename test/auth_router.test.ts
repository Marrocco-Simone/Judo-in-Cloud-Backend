import jwt from 'jsonwebtoken';
import { User } from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { app } = require('../src/bootstrap');
const node_fetch = require('node-fetch');

let server;
const auth_route = 'http://localhost:2500/api/v1/auth';

const user_id = new mongoose.Types.ObjectId();

beforeAll(async () => {
  mongoose.connect(process.env.MONGO_URL_TEST);

  await User.remove({});

  const hash = await bcrypt.hash('pwd', 10);

  const user_to_save = new User({
    _id: user_id,
    username: 'validUser',
    password: hash
  });

  await user_to_save.save();

  server = app.listen(2500);
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

test(`GET ${auth_route} should give back the user associated to the jwt if valid`, async () => {
  const valid_user = { _id: user_id, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(auth_route, {
    headers: {
      authorization: access_token
    }
  });

  const json_res = await res.json();

  expect(json_res).toMatchObject({
    status: 'success',
    data: {
      __v: 0,
      _id: user_id.toString(),
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
  const valid_user = { _id: user_id, username: 'validUser' };
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

  expect(json_res).toMatchObject({
    data: {
      access_token: access_jwt,
      user: {
        __v: 0,
        _id: user_id,
        username: 'validUser'
      }
    },
    status: 'success'
  });
});
