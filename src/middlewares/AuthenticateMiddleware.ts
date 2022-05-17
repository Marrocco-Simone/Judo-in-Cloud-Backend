import express = require('express');
import jwt = require('jsonwebtoken');
import { unauthorized } from '../controllers/base_controller';

export const authenticate_token: express.RequestHandler = (req, res, next) => {
  const auth_header = req.headers.authorization;
  if (!auth_header) {
    return unauthorized(res);
  }
  const token = auth_header.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return unauthorized(res);
    }
    // here the user can be loaded from the db to make it available in every controller
    req.user = user;
    next();
  });
};
