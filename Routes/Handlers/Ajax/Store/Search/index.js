const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const {model, moment} = require('util/func');
const co = require('co');

router.get('/', (req, res) => {
  const queryObj = {
    query: req.query.query,
    order: req.query.order || 'new',
    page: req.query.page || 0
  };
  const user = res.locals.user;

  co(function* RouterHandler() {
    const [posts, forums] = yield [
      model
        .Search
        .listByQuery(queryObj.query, queryObj.page, queryObj.order, user),
      model
        .Search
        .listForumByQuery(queryObj.query, queryObj.page, queryObj.order, user)
    ];

    for (let i in posts.results) {
      for (let j in posts.results[i]) {
        if (j === 'created_at') {
          posts.results[i][j] = moment(posts.results[i][j]).fromNow();
        }
      }
    }

    assign(res.resultData, {
      SearchStore: {
        forum: {
          data: forums,
          collection: {
            current_page: 1,
            limit: 10,
            next_page: (forums.total > 10) ? 2 : null,
            total: forums.total
          }
        },
        search: {
          posts: posts,
          collection: {
            current_page: 1,
            limit: 10,
            next_page: (posts.total > 10) ? 2 : null,
            total: posts.total
          }
        },
        query: queryObj.query
      },
    });

    res.json(res.resultData);
  });
});

module.exports = router;