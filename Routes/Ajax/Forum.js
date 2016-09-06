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

router.get('/new', function (req, res) {
  const user = res.locals.user;
  const page = req.query.p;

  M
    .Forum
    .getList({
      order: {
        column: 'created_at',
        direction: 'DESC'
      },
      page: page || 1,
      limit: 10
    })
    .then(forums => {
      res.json(forums);
    })
});

router.get('/hot', function (req, res) {
  const user = res.locals.user;
  const page = req.query.p;

  M
    .Forum
    .getList({
      order: {
        column: 'created_at',
        direction: 'DESC'
      },
      page: page || 1,
      limit: 10
    })
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
    creator_id: user.id,
    created_at: new Date()
  };

  M
    .Forum
    .createForum(forumObj, user)
    .then(forum => {
      res.json(forum);
    })
});

router.put('/', function (req, res) {
  const user = res.locals.user;
  const forumObj = {
    id: req.body.id,
    body: {
      sub_header: req.body.sub_header,
      description: req.body.description,
      rule: req.body.rule,
      creator_id: user.id
    }
  };

  M
    .Forum
    .patchForum(forumObj, user)
    .then(forum => {
      res.json(forum);
    })
});

module.exports = router;
