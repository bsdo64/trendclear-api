const express = require('express');
const Promise = require('bluebird');
const router = express.Router();
const assign = require('deep-assign');
const M = require('../../../../vn-api-model');
const {moment} = require('../../../helper/func');
const _ = require('lodash');
_.mixin(require('lodash-deep'));

router.get(['/points'], function (req, res, next) {

  res.json(res.resultData);
});

router.get(['/venalinks', '/venalinks/active'], function (req, res, next) {

  res.json(res.resultData);
});

router.get('/venalinks/share', function (req, res, next) {

  res.json(res.resultData);
});

module.exports = router;