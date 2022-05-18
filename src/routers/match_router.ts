import express = require('express');
import { match } from '../schemas/Match';
/* ELIMINA */import { athlete } from '../schemas/Athlete'
/** api for matches */
export const match_router = express.Router();

/* ELIMINA */match_router.get('/inizialize', async (req, res) => {
  try{
    athlete.insertMany([{
      name: 'Mario',
      surname: 'Rossi',
      club: 'Judo Kodokan Lavis',
      gender: 'M',
      weight: 66,
      birth_year: 2000,
    }, {
      name: 'Giuseppe Giovanni',
      surname: 'Esposito',
      club: 'Judo e Movi-Mente Le Sorgive',
      gender: 'M',
      weight: 66,
      birth_year: 2000,
    }]);
  }catch(e){
    console.log(e);
  }
});

match_router.get('/:matchid', async (req, res) => {
  const match_id = req.params.matchid;
  match.findById(match_id);
});
