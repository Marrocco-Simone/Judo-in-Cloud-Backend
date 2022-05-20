import { RequestHandler } from 'express';
import { error, fail, success } from './base_controller';
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import { User } from '../schemas/User';

export const login: RequestHandler = async function(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return fail(res, 'Inserisci username e password');
  }
  const invalid_data_msg = 'Nome utente o password non validi';

  try {
    // authenticate the user
    const user = await User.findOne({ username });
    if (user === null) {
      return fail(res, invalid_data_msg);
    }
    const pw_check = await bcrypt.compare(password, user.password);
    if (!pw_check) {
      return fail(res, invalid_data_msg);
    }

    // return the jwt
    const jwt_payload = { _id: user._id, username: user.username };
    // token that expires in 24 hours
    const access_token = jwt.sign(jwt_payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 });
    return success(res, { access_token, user });
  } catch (err) {
    // mongoose or bcrypt error
    return error(res, 'Errore interno durante il login');
  }
};

export const me: RequestHandler = async function(req, res) {
  if (!req.user) {
    console.error('[AUTH CONTROLLER] auth/me does not have user in the request');
    return error(res, 'Errore interno');
  }
  return success(res, req.user);
};
