import express = require('express');
/** apis for athletes */
export const athlete_router = express.Router();

athlete_router.get('/test', async (req, res) => {
  res.json({ success: 1 });
});
