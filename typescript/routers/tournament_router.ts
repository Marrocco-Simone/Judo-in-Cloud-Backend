export {}; //needed or typescripts gives some strange errors
const express = require('express');
/** api for tournaments */
export const tournament_router = express.Router();

tournament_router.get('/test', async (req,res) => {
    res.json({success: 1});
});