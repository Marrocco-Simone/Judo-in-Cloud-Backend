// export {}; //needed or typescripts gives some strange errors
const express = require('express');
// /** apis for athletes */
// export const athlete_router = express.Router();

// athlete_router.get('/test', async (req,res) => {
//    res.json({success: 1});
// });

const athlete_router = express.Router();
const Athlets = require('/models/ath')

// Getting all
athlete_router.get('/', async (req, res) => {
    try{
        const athlets = await Athlets.find();
        res.json(athlets);
    }catch (err){
        res.status(500).json({ message: err.message })
    }
})

// Creating One
athlete_router.post('/', async (req, res) => {
    const athlete = new Athlets({
        id: req.body.id,
        name: req.body.name,
        surname: req.body.surname,
        club: req.body.club,
        gender: req.body.gender,
        weight: req.body.weight,
        birth_year: req.body.birth_year
    })
    try{
        const newAthlete = await athlete.save();
        res.status(201).json(newAthlete)
    }catch(err){
        res.status(400).json({ message: err.message });
    }
})

module.exports = athlete_router;
