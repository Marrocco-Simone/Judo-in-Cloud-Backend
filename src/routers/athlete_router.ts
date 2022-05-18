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

// Creating Many
athlete_router.post('/', async (req, res) => {
    // User model
    const Athlete = mongoose.model('Athlete', {
        id: { type: SchemaTypes.ObjectId },
        name: { type: String },
        surname: { type: String },
        club: { type: String },
        gender: { type: String },
        weight: { type: Number },
        birth_year: { type: Number },
    });

    const idArray = (urlParams.getAll('id'));
    const nameArray = (urlParams.getAll('name'));
    const surnameArray = (urlParams.getAll('surname'));
    const clubArray = (urlParams.getAll('club'));
    const genderArray = (urlParams.getAll('gender'));
    const weightArray = (urlParams.getAll('weight'));
    const birthYearArray = (urlParams.getAll('birth_year'));
    var athleteArray = [];
    const ath = new Object();

    for(var i = 0; i<idArray.length; i++){
        ath.id=idArray[i];
        ath.name=nameArray[i];
        ath.surname=surnameArray[i];
        ath.club=clubArray[i];
        ath.gender=genderArray[i];
        ath.weight=weightArray[i];
        ath.birth_year=birthYearArray[i];
        athleteArray.push(ath);
    }
    
    // Function call
    Athlete.insertMany(athleteArray).then(function(){
        console.log("Data inserted")  // Success
    }).catch(function(error){
        console.log(error)      // Failure
    });
})

module.exports = athlete_router;
