import { RequestHandler } from 'express';
import { error, fail, success } from './base_controller';
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import { User } from '../schemas/User';

export const login: RequestHandler = async function(req, res) {
  // authenticate the user
  const user = await User.findOne({ username: req.body.username });

  if (user === null) {
    return fail(res, 'User not found', 404);
  }

  try {
    const pw_check = await bcrypt.compare(req.body.password, user.password);
    if (!pw_check) {
      return fail(res, 'Incorrect password');
    }
  } catch (err) {
    return error(res, 'Error during authentication');
  }

  // return the jwt
  const jwt_payload = { _id: user._id, username: user.username };
  // token that expires in 24 hours
  const access_token = jwt.sign(jwt_payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
  return success(res, { access_token });
};
