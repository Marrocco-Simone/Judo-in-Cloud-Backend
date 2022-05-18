const express = require('express');
const ageclass_router = express.Router();
import {Age_class} from '../schemas/AgeClass';

// Getting all
ageclass_router.get('/params', async (req, res) => {
    try{
        const age_class = await Age_class.find();
        res.json(age_class);
    }catch (err){
        res.status(500).json({ message: err.message })
    }
})

// Update One
ageclass_router.post('/params', async (req, res) => {
    const age_class = new Age_class({
        _id: SchemaTypes.ObjectId,
        max_age: Number,
        competition_id: {
            type: SchemaTypes.ObjectId,
            ref: 'Competition'
        },
        name: String,
        closed: Boolean,
        params: age_class_params_schema,
    })
    try{
        //const newAthlete = await athlete.save();
        var a_c = new Age_class({
            max_age: req.max_age,
            competition_id: req.competition_id,
            name: req.name,
            closed: req.closed,
            params: req.params
        });

        var updatedAge_class = a_c.toObject();

        Age_class.update({_id: age_class._id}, updatedAge_class, {upsert: true}, (err) => {
            res.status(500).json(err.message);
        })
        res.status(201).json(updatedAge_class)
    }catch(err){
        res.status(400).json({ message: err.message });
    }
})



module.exports = ageclass_router;
