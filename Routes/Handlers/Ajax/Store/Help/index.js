const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json(res.resultData);
});

router.get('/guide', (req, res) => {
  res.json(res.resultData);
});

module.exports = router;