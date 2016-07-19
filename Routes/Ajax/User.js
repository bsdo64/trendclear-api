const express = require('express');
const router = express.Router();
const moment = require('moment');

const M = require('vn-api-model');

router.get('/likes', function (req, res) {
  const page = req.query.page ? req.query.page - 1 : 0;
  const user = res.locals.user;

  return M
    .Post
    .likePostList(page, user)
    .then(posts => {
      "use strict";

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      const limit = 10;
      const nextPage = page + 1;
      const data = {
        type: 'likePostList',
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

router.get('/posts', function (req, res) {
  const page = req.query.page ? req.query.page - 1 : 0;
  const user = res.locals.user;

  return M
    .Post
    .myWritePostList(page, user)
    .then(posts => {
      "use strict";

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      const limit = 10;
      const nextPage = page + 1;
      const data = {
        type: 'myWritePostList',
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

router.get('/comments', function (req, res) {
  const page = req.query.page ? req.query.page - 1 : 0;
  const user = res.locals.user;

  return M
    .Post
    .myWriteCommentPostList(page, user)
    .then(posts => {
      "use strict";

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      const limit = 10;
      const nextPage = page + 1;
      const data = {
        type: 'myWriteCommentPostList',
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

router.post('/avatarImg', function (req, res) {
  const imgObj = {
    file: req.body.file
  };
  const user = res.locals.user;
  
  M
    .User
    .updateAvatarImg(imgObj, user)
    .then(function (result) {
      res.json({success: 'ok', user: {id: user.id}});
    })
    .catch(function (err) {
      console.error(err);
      res.json({
        message: 'can\'t make token',
        error: err
      });
    });
});

router.post('/levelup', (req, res) => {
  const user = res.locals.user;
  res.json(user.trendbox);
});

router.post('/setting/password', (req, res) => {
  const passwordObj = {
    oldPassword: req.body.oldPassword,
    newPassword: req.body.newPassword
  };
  const user = res.locals.user;
  
  M
    .User
    .updatePassword(passwordObj, user)
    .then((result) => {
      console.log(result);
      res.json('ok');
    })
    .catch(err => {

      if (err.message === 'Password is not Correct') {
        res.json({
          code: 1,
          message: 'password change error',
          error: err
        })
      } else {
        res.json({
          code: null,
          message: 'password change error',
          error: err
        })
      }
    })
});


router.post('/setting/profile', (req, res) => {
  const user = res.locals.user;
  const profileObj = {
    sex: req.body.sex,
    birth: req.body.birth
  };

  M
    .User
    .updateProfile(profileObj, user)
    .then((profile) => {
      res.json(profile);
    })
    .catch(err => {

      console.log(err);

      if (err.message === 'Password is not Correct') {
        res.json({
          code: 1,
          message: 'password change error',
          error: err
        })
      } else {
        res.json({
          code: null,
          message: 'profile change error',
          error: err
        })
      }
    })
});

router.put('/noti/read', (req, res) => {
  const user = res.locals.user;
  const notiReadObj = {
    id: req.body.id
  };
  
  M
    .User
    .readNoti(notiReadObj, user)
    .then(result => {
      res.json(result)
    })
    .catch(err => {
      console.log(err);
      res.json({
        code: null,
        message: 'noti read error',
        error: err
      })
    })
});

module.exports = router;
