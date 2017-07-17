const express = require('express');
const router = express.Router();
const { moment, model } = require('util/func');
const co = require('co');


router.get('/likes', function (req, res) {
  const page = req.query.page ? req.query.page - 1 : 0;
  const user = res.locals.user;

  return model
    .Post
    .likePostList(page, user)
    .then(posts => {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).fromNow();
          }
        }
      }

      const limit = 10;
      const nextPage = page + 1;
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

router.get('/posts', function (req, res) {
  const page = req.query.page ? req.query.page - 1 : 0;
  const user = res.locals.user;

  return model
    .Post
    .myWritePostList(page, user)
    .then(posts => {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).fromNow();
          }
        }
      }

      const limit = 10;
      const nextPage = page + 1;
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

router.get('/comments', function (req, res) {
  const page = req.query.page ? req.query.page - 1 : 0;
  const user = res.locals.user;

  return model
    .Post
    .myWriteCommentPostList(page, user)
    .then(posts => {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).fromNow();
          }
        }
      }

      const limit = 10;
      const nextPage = page + 1;
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

router.post('/avatarImg', function (req, res) {
  const imgObj = {
    file: req.body.file
  };
  const user = res.locals.user;
  
  model
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

router.delete('/avatarImg', (req, res) => {
  const user = res.locals.user;

  model
    .User
    .removeAvatarImg(user)
    .then(result => {

      res.json(result);
    })
    .catch(function (err) {
      console.error(err);
      res.json({
        message: 'can\'t not delete image',
        error: err
      });
    });
});

router.post('/setting/password', (req, res) => {
  const passwordObj = {
    oldPassword: req.body.oldPassword,
    newPassword: req.body.newPassword
  };
  const user = res.locals.user;
  
  model
    .User
    .updatePassword(passwordObj, user)
    .then((result) => {
      res.json('ok');
    })
    .catch(err => {

      if (err.message === 'Password is not Correct') {
        res.json({
          code: 1,
          message: 'password change error',
          error: err
        });
      } else {
        res.json({
          code: null,
          message: 'password change error',
          error: err
        });
      }
    });
});


router.post('/setting/profile', (req, res) => {
  const user = res.locals.user;
  const profileObj = {
    sex: req.body.sex,
    birth: req.body.birth
  };

  model
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
        });
      } else {
        res.json({
          code: null,
          message: 'profile change error',
          error: err
        });
      }
    });
});

router.put('/noti/read', (req, res) => {
  const user = res.locals.user;
  const notiReadObj = {
    id: req.body.id
  };
  
  model
    .User
    .readNoti(notiReadObj, user)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
      res.json({
        code: null,
        message: 'noti read error',
        error: err
      });
    });
});

router.post('/forum/follow', (req, res) => {
  const user = res.locals.user;
  const followObj = {
    forumId: req.body.forumId
  };

  model
    .Forum
    .followForum(followObj, user)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
      res.json({
        code: null,
        message: 'forum follow error',
        error: err
      });
    });
});

router.post('/forum/unfollow', (req, res) => {
  const user = res.locals.user;
  const followObj = {
    forum_id: req.body.id,
    user_id: user.id,
  };

  model
    .Forum
    .unFollowForum(followObj, user)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
      res.json({
        code: null,
        message: 'forum follow error',
        error: err
      });
    });
});


router.post('/report', (req, res) => {
  const user = res.locals.user;
  const reportObj = {
    type: req.body.type,
    type_id: req.body.typeId,
    report_type: req.body.reportId,
    description: req.body.description,
    created_at: new Date(),
    reporter_id: user.id
  };

  model
    .User
    .reportItem(reportObj, user)
    .then(function (reportItem) {

      res.json(reportItem);
    })
    .catch(err => {
      console.error(err);
      console.error(err.stack);

      if (err.message === 'User not Found') {
        res.json({
          message: 'user not found',
          error: err
        });
      } else {
        res.json({
          message: 'can\'t make token',
          error: err
        });
      }
    });
});

router.delete('/removeItem', (req, res) => {
  const user = res.locals.user;
  const deleteObj = {
    type: req.body.type,
    type_id: req.body.typeId,
    user_id: user.id
  };

  co(function* RouterHandler() {
    res.json(yield model.User.deleteItem(deleteObj));
  });
});

router.post('/resetPassword', (req, res) => {
  const user = res.locals.user;
  const findObj = {
    email: req.body.email
  };

  co(function* RouterHandler() {
    res.json(yield model.User.resetPassword(findObj));
  });
});

router.post('/payback/rp', (req, res) => {
  const user = res.locals.user;
  const paybackRPObj = {
    userVenalinkId: req.body.userVenalinkId
  };

  co(function* RouterHandler() {
    yield model.Venalink.checkPaybackRP(paybackRPObj, user);

    res.json({
      list: yield model.Venalink.makeQuery('tc_user_has_venalinks', {
        where: { user_id: user.id },
        eager: ['venalink.participants'],
        order: {
          column: 'request_at',
          direction: 'DESC'
        }}),
      trendbox: yield model.User.getUserTrendbox(user),
      userId: user.id
    });
  });
});

router.get('/points', (req, res) => {
  const user = res.locals.user;
  const page = parseInt(req.query.p - 1) || 0;
  const pointType = req.query.pointType || 'TP';
  const limit = 20;

  model
    .Point
    .getUserAccountList({
      where: {
        user_id: user.id,
        point_type: pointType
      },
      order: {
        column: 'created_at',
        direction: 'DESC'
      },
      page: parseInt(page), // (start from 0)
      limit: limit
    }, user)
    .then(data => {

      data.current_page = page + 1;
      data.next_page = (limit * (page + 1) < data.total) ? page + 2 : null;
      data.limit = limit;

      res.json({
        data: data,
        target: 'user',
        targetId: user.id
      });
    })
    .catch((e) => {
      res.json(e);
    });
});

router.get('/points/chargeLog', (req, res) => {
  const user = res.locals.user;
  const page = parseInt(req.query.p - 1) || 0;
  const limit = 20;

  model
    .Point
    .getPaymentList({
      page: page,
      limit: limit,
      where: {
        user_id: user.id
      },
      order: {
        column: 'id',
        direction: 'ASC'
      }
    })
    .then(data => {

      data.current_page = page + 1;
      data.next_page = (limit * (page + 1) < data.total) ? page + 2 : null;
      data.limit = limit;

      res.json({
        data: data,
        target: 'user',
        targetId: user.id
      });
    })
    .catch((e) => {
      res.json(e);
    });
});

module.exports = router;
