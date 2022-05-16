export {}; //needed or typescripts gives some strange errors
const express = require('express');
/** apis for age classes */
export const ageclass_router = express.Router();

ageclass_router.get('/test', async (req,res) => {
    res.json({success: 1});
});