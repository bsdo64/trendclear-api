const express = require('express');
const router = express.Router();
const { moment, model } = require('util/func');

router.get('/', function (req, res) {
  const title = req.query.title;
  const user = res.locals.user;

  model
    .Forum
    .getForumList(title, 'title')
    .then(forums => {
      res.json(forums);
    })
});

router.get('/new', function (req, res) {
  const user = res.locals.user;
  const page = req.query.p;

  model
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

  model
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

  model
    .Forum
    .createForum(forumObj, user)
    .then(forum => {
          res.json(forum);
    });
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

  model
    .Forum
    .patchForum(forumObj, user)
    .then(forum => {
      res.json(forum);
    })
});

router.post('/prefix', (req, res) => {
  const user = res.locals.user;
  const prefixObj = {
    forum_id: req.body.forumId,
    name: req.body.prefixName
  };

  model
    .Forum
    .addPrefix(prefixObj)
    .then(prefix => {
      res.json(prefix);
    })
});

router.put('/prefix', (req, res) => {
  const user = res.locals.user;
  const prefixObj = {
    id: req.body.id,
    forum_id: req.body.forumId,
    name: req.body.prefixName
  };

  model
    .Forum
    .updatePrefix(prefixObj)
    .then(prefix => {
      res.json(prefix);
    })
});

router.delete('/prefix', (req, res) => {
  const user = res.locals.user;
  const prefixObj = {
    id: req.body.id
  };

  model
    .Forum
    .deletePrefix(prefixObj)
    .then(prefix => {
      res.json(prefix);
    })
});

router.post('/manager', (req, res) => {
  const user = res.locals.user;
  const obj = {
    forum_id: req.body.forumId,
    user_id: req.body.userId
  };

  model
    .Forum
    .addManager(obj)
    .then(user => {
      res.json(user);
    })
});

router.delete('/manager', (req, res) => {
  const user = res.locals.user;
  const obj = {
    forum_id: req.body.forumId,
    user_id: req.body.userId
  };

  model
    .Forum
    .deleteManager(obj)
    .then(prefix => {
      res.json(prefix);
    })
});

router.delete('/announce', (req, res) => {
  const user = res.locals.user;
  const obj = {
    forum_id: req.body.forumId,
    post_id: req.body.postId
  };

  model
    .Forum
    .deleteAnnounce(obj)
    .then(prefix => {
      res.json(prefix);
    })
});

router.post('/banUser', (req, res) => {
  const user = res.locals.user;
  const obj = {
    forum_id: req.body.forumId,
    user_id: req.body.userId
  };

  model
    .Forum
    .addBanUser(obj)
    .then(prefix => {
      res.json(prefix);
    })
});

router.delete('/banUser', (req, res) => {
  const user = res.locals.user;
  const obj = {
    forum_id: req.body.forumId,
    user_id: req.body.userId
  };

  model
    .Forum
    .deleteBanUser(obj)
    .then(prefix => {
      res.json(prefix);
    })
});

module.exports = router;
