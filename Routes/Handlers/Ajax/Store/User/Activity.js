const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const {moment, model} = require('util/func');

router.use((req, res, next) => {
  const user = res.locals.user;

  model
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
      next(err);
    });
});

router.get(['/', '/likes'], (req, res) => {
  const user = res.locals.user;

  return model
    .Post
    .likePostList(0, user)
    .then(posts => {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).fromNow();
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

router.get('/posts', (req, res) => {
  const user = res.locals.user;

  return model
    .Post
    .myWritePostList(0, user)
    .then(posts => {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).fromNow();
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

router.get('/comments', (req, res) => {
  const user = res.locals.user;

  return model
    .Post
    .myWriteCommentPostList(0, user)
    .then(posts => {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).fromNow();
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