import express from 'express';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { User } from '../schemas';
import { success, error, fail } from './base_controller';

export const delete_user: RequestHandler = async (req, res) => {
    try {
      const id = new Types.ObjectId(req.params.user_id);
      const user = User.findById(id);
      if(!user) return fail(res, 'User not found', 404);
      await user.remove();
      success(res, user);
    } catch (err) {
      error(res, err.message);
    }
  };
