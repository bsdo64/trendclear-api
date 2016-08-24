const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const M = require('../../../../vn-api-model');
const moment = require('moment');
const _ = require('lodash');
_.mixin(require('lodash-deep'));

router.use((req, res, next) => {
  const user = res.locals.user;

  M
    .User
    .getActivityMeta(user)
    .then((meta) => {
      assign(res.resultData, {
        ActivityStore: {
          meta: meta
        }
      });
      next();
    })
    .catch(err => {
      next(err)
    });
});

router.get(['/', '/likes'], function (req, res, next) {
  const user = res.locals.user;

  return M
    .Post
    .likePostList(0, user)
    .then(posts => {
      "use strict";

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      assign(res.resultData, {
        ActivityStore: {
          type: 'likePostList',
          posts: {
            data: posts.results,
            collection: {
              current_page: 1,
              limit: 10,
              next_page: (posts.total > 10) ? 2 : null,
              total: posts.total
            }
          }
        }
      });

      res.json(res.resultData);
    });
});

router.get('/posts', function (req, res, next) {
  const user = res.locals.user;

  return M
    .Post
    .myWritePostList(0, user)
    .then(posts => {
      "use strict";

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      assign(res.resultData, {
        ActivityStore: {
          type: 'myWritePostList',
          posts: {
            data: posts.results,
            collection: {
              current_page: 1,
              limit: 10,
              next_page: (posts.total > 10) ? 2 : null,
              total: posts.total
            }
          }
        }
      });

      res.json(res.resultData);
    });
});

router.get('/comments', function (req, res, next) {
  const user = res.locals.user;

  return M
    .Post
    .myWriteCommentPostList(0, user)
    .then(posts => {
      "use strict";

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      assign(res.resultData, {
        ActivityStore: {
          type: 'myWriteCommentPostList',
          posts: {
            data: posts.results,
            collection: {
              current_page: 1,
              limit: 10,
              next_page: (posts.total > 10) ? 2 : null,
              total: posts.total
            }
          }
        }
      });

      res.json(res.resultData);
    });
});

module.exports = router;