import jwt from 'jsonwebtoken';
import { Competition, User } from '../src/schemas';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { AgeClassInterface, AgeClass } from '../src/schemas/AgeClass';
import { CategoryInterface, Category } from '../src/schemas/Category';

const { app } = require('../src/bootstrap');
const node_fetch = require('node-fetch');

let server;
const age_class_route = 'http://localhost:2500/api/v1/age_classes';

const user_id_1 = new mongoose.Types.ObjectId();
const competition_id = new mongoose.Types.ObjectId();
const age_class_id_1 = new mongoose.Types.ObjectId();
const age_class_id_2 = new mongoose.Types.ObjectId();
const category_id_1 = new mongoose.Types.ObjectId();
const category_id_2 = new mongoose.Types.ObjectId();
const category_id_3 = new mongoose.Types.ObjectId();
const category_id_4 = new mongoose.Types.ObjectId();

const age_classes: AgeClassInterface[] = [
  {
    _id: age_class_id_1,
    max_age: 15,
    competition: competition_id,
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
    max_weight: 60,
    gender: 'M',
  },
  {
    _id: category_id_2,
    age_class: age_class_id_2,
    max_weight: 50,
    gender: 'M',
  },
  {
    _id: category_id_3,
    age_class: age_class_id_1,
    max_weight: 55,
    gender: 'F',
  },
  {
    _id: category_id_4,
    age_class: age_class_id_1,
    max_weight: 50,
    gender: 'M',
  }
];

beforeAll(async () => {
  mongoose.connect(process.env.MONGO_URL_TEST);

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

  server = app.listen(2500);
});

afterAll(async () => {
  await mongoose.disconnect();

  server.close();
});

test(`GET ${age_class_route} should give back unauthorized error if there is no jwt`, async () => {
  const res = await node_fetch(age_class_route);

  const json_res = await res.json();

  expect(json_res).toEqual({
    message: 'Unauthorized',
    status: 'fail'
  });
});

test(`GET ${age_class_route} should give back all the age classes with a valid jwt, and fill all the category information inside the array`, async () => {
  const valid_user = { _id: user_id_1, username: 'validUser' };
  const access_jwt = jwt.sign(valid_user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  const access_token = `Bearer ${access_jwt}`;

  const res = await node_fetch(age_class_route, {
    headers: {
      authorization: access_token
    }
  });

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
        competition: competition_id.toString(),
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
        ],
        closed: false,
        competition: competition_id.toString(),
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
