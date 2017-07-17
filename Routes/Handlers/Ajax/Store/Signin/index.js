const express = require('express');
const router = express.Router();
const assign = require('deep-assign');

router.get('/', (req, res) => {

  res.json(res.resultData);
});

module.exports = router;