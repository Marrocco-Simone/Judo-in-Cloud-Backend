import express from 'express';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { AgeClass, Athlete, Category, Competition, Match, Tournament, User } from '../schemas';
import { success, error, fail } from './base_controller';

export const delete_user: RequestHandler = async (req, res) => {
    try {
      const id = new Types.ObjectId(req.params.user_id);
      const user = await User.findById(id);
      if(!user) return fail(res, 'User not found', 404);
      const _competition = await Competition.find({competition: user.competition});
      const _tournament = await Tournament.find({competition: user.competition});
      const _age_class = await AgeClass.find({competition: _competition});
      await Athlete.deleteMany({competition: _competition});
      await Match.deleteMany({tournament: _tournament});
      await Tournament.deleteMany({competition: _competition});
      await Category.deleteMany({age_class: _age_class});
      await AgeClass.deleteMany({_id: _age_class});
      await Competition.deleteOne(_competition);
      await user.remove();
      success(res, user);
    } catch (err) {
      error(res, err.message);
    }
  };
