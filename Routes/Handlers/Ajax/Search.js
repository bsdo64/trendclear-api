const express = require('express');
const router = express.Router();
const { moment, model } = require('util/func');

router.get('/', function (req, res) {
  const queryObj = {
    query: req.query.query,
    order: req.query.order || 'new',
    page: parseInt(req.query.page, 10) - 1 || 0
  };
  const user = res.locals.user;
  const visitor = res.locals.visitor;

  model
    .Search
    .listByQuery(queryObj.query, queryObj.page, queryObj.order, user, visitor)
    .then(function (posts) {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).fromNow();
          }
        }
      }

      const limit = 10;
      const nextPage = queryObj.page + 1;
      const data = {
        data: posts.results,
        collection: {
          current_page: nextPage,
          limit: limit,
          next_page: (limit * nextPage < posts.total) ? (nextPage + 1) : null,
          total: posts.total
        }
      };

      res.json(data);
    });
});

router.get('/forum/list', (req, res) => {
  const queryObj = {
    query: req.query.query,
    order: req.query.order || 'new',
    page: parseInt(req.query.page, 10) - 1 || 0
  };
  const user = res.locals.user;

  model
    .Search
    .listForumByQuery(queryObj.query, queryObj.page, queryObj.order, user)
    .then(forums => {
      const limit = 10;
      const nextPage = queryObj.page + 1;
      const data = {
        data: forums.results,
        collection: {
          current_page: nextPage,
          limit: limit,
          next_page: (limit * nextPage < forums.total) ? (nextPage + 1) : null,
          total: forums.total
        }
      };

      res.json(data);
    });
});

router.get('/forum', function (req, res) {
  const q = req.query.q;
  const user = res.locals.user;

  model
    .Search
    .findForumByQuery(q)
    .then(function (totalForums) {
      res.json(totalForums);
    })
});

router.get('/users', function (req, res) {
  const searchObj = {
    nick: req.query.nick,
    forumId: req.query.forumId,
    type: req.query.type || 'default'
  };
  const user = res.locals.user;

  model
    .Search
    .findUsersByNick(searchObj, user)
    .then(function (totalUsers) {
      res.json(totalUsers);
    });
});

router.get('/queryRank', function (req, res) {
  model
    .Search
    .findQueryRank()
    .then(function (result) {
      res.json(result);
    });
});

module.exports = router;