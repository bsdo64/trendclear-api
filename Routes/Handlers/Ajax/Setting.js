const express = require('express');
const router = express.Router();
const {moment} = require('../../helper/func');
const helper = require('../../helper/func');

const M = require('../../../vn-api-model/index');

router.get('/', function (req, res) {
  res.json({});
});

module.exports = router;