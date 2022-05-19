import express = require('express');
import { AgeClass } from '../schemas/AgeClass';
import { SchemaTypes } from 'mongoose';
/** api for tournaments */
export const ageclass_router = express.Router();

// Getting all
ageclass_router.get('/params', async (req, res) => {
  try {
    const age_class = await AgeClass.find();
    res.json(age_class);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update One
ageclass_router.post('/params', async (req, res) => {
  const age_class = new AgeClass({
    _id: SchemaTypes.ObjectId,
    max_age: Number,
    competition_id: {
      type: SchemaTypes.ObjectId,
      ref: 'Competition'
    },
    name: String,
    closed: Boolean,
    params: AgeClass,
  });
  try {
    const a_c = new AgeClass({
      max_age: req.body.max_age,
      competition_id: req.body.competition_id,
      name: req.body.name,
      closed: req.body.closed,
      params: req.body.params
    });

    const updatedAge_class = a_c.toObject();

    AgeClass.updateOne({ _id: age_class._id }, updatedAge_class, { upsert: true }, (err) => {
      res.status(500).json(err.message);
    });
    res.status(201).json(updatedAge_class);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
