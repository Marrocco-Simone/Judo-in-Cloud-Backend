const express = require('express');
const tournaments_router = express.Router();
const Tournaments = require('../schemas/Tournaments')

// Getting all
tournaments_router.get('/', async (req, res) => {
    try{
        const tournaments = await Tournaments.find();
        res.json(tournaments);
    }catch (err){
        res.status(500).json({ message: err.message })
    }
})

module.exports = tournaments_router;
