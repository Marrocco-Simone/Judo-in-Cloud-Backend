// export {}; //needed or typescripts gives some strange errors
const express = require('express');
// /** apis for athletes */
// export const athlete_router = express.Router();

// athlete_router.get('/test', async (req,res) => {
//    res.json({success: 1});
// });

const athlete_router = express.Router();
import {Athelts} from '../schemas/Athlete';

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

// Creating Many
athlete_router.get('/', async (req, res) => {
    try{
        // Function call
        User.insertMany([
            { id: 1, name: 'Steve', surname: 'Vinewood', clud: 'Judo Lavis', gender: 'M', weight: 80, birth_year: 2000},
            { id: 1, name: 'Nick', surname: 'Jackinson', clud: 'Judo Pergine', gender: 'M', weight: 84, birth_year: 2000},
            { id: 1, name: 'Andrea', surname: 'Mariani', clud: 'Judo Trento', gender: 'M', weight: 79, birth_year: 2000}
        ]).then(function(){
            console.log("Data inserted")  // Success
        }).catch(function(error){
            console.log(error)      // Failure
        });
    }catch(err){
        console.log(status, err.message);
    }
})

module.exports = athlete_router;
