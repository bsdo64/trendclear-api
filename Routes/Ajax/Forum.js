const express = require('express');
const router = express.Router();
const moment = require('moment');
const helper = require('../helper/func');

const M = require('../../vn-api-model');

router.get('/', function (req, res) {
  const title = req.query.title;
  const user = res.locals.user;

  M
    .Forum
    .getForumList(title, 'title')
    .then(forums => {
      res.json(forums);
    })
});

module.exports = router;
