// export {}; //needed or typescripts gives some strange errors
import { error, success } from '../controllers/base_controller';
import { Athlete } from '../schemas/Athlete';
const express = require('express');

// /** apis for athletes */
// export const athlete_router = express.Router();

// athlete_router.get('/test', async (req,res) => {
//    res.json({success: 1});
// });

export const athlete_router = express.Router();

// Getting all
athlete_router.get('/', async (req, res) => {
  try {
    const athlets = await Athlete.find();
    success(res, athlets);
  } catch (err) {
    error(res, err.message, 500);
  }
});

// Creating One
athlete_router.post('/', async (req, res) => {
  const body: {
    name: string,
    surname: string,
    competition: string,
    club: string,
    gender: 'M'|'F',
    weight: number,
    birth_year: number
  } = req.body;

  const athlete = new Athlete({
    name: body.name,
    surname: body.surname,
    club: body.club,
    competition: body.competition,
    gender: body.gender,
    weight: body.weight,
    birth_year: body.birth_year
  });
  try {
    const new_athlete = await athlete.save();
    success(res, new_athlete);
  } catch (err) {
    error(res, err.message, 400);
  }
});

// Creating Many
athlete_router.get('/', async () => {
  try {
    // Function call
    Athlete.insertMany([
      { id: 1, name: 'Steve', surname: 'Vinewood', clud: 'Judo Lavis', gender: 'M', weight: 80, birth_year: 2000 },
      { id: 1, name: 'Nick', surname: 'Jackinson', clud: 'Judo Pergine', gender: 'M', weight: 84, birth_year: 2000 },
      { id: 1, name: 'Andrea', surname: 'Mariani', clud: 'Judo Trento', gender: 'M', weight: 79, birth_year: 2000 }
    ]).then(function() {
      console.log('Data inserted'); // Success
    }).catch(function(error) {
      console.log(error); // Failure
    });
  } catch (err) {
    console.log(500, err.message);
  }
});
