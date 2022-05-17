import express = require('express');
/** api for matches */
export const match_router = express.Router();

match_router.get('/test', async (req, res) => {
  res.json({ success: 1 });
});
