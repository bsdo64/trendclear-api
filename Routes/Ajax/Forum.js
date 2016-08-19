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

router.post('/', function (req, res) {
  const user = res.locals.user;
  const forumObj = {
    title: req.body.title,
    sub_header: req.body.sub_header,
    description: req.body.description,
    rule: req.body.rule,
    using: 1,
    order: 1,
    creator_id: user.id
  };

  M
    .Forum
    .createForum(forumObj, user)
    .then(forum => {
      res.json(forum);
    })
});

module.exports = router;
