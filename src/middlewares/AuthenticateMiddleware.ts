import express = require('express');
import jwt = require('jsonwebtoken');
import { error, unauthorized } from '../controllers/base_controller';
import { User } from '../schemas/User';

export const authenticate_token: express.RequestHandler = (req, res, next) => {
  const auth_header = req.headers.authorization;
  if (!auth_header) {
    return unauthorized(res);
  }
  const token = auth_header.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) {
      return unauthorized(res);
    }
    const user_id = (user as jwt.JwtPayload)._id;
    try {
      const user = await User.findById(user_id);
      await user.populate('competition_id');
      req.user = user;
    } catch (err) {
      return error(res, 'Errore durante l\'autenticazione');
    }
    next();
  });
};
