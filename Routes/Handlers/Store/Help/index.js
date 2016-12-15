const express = require('express');
const router = express.Router();
const M = require('../../../../vn-api-model');

router.get('/', (req, res) => {
  res.json(res.resultData);
});

router.get('/guide', (req, res) => {
  res.json(res.resultData);
});

module.exports = router;