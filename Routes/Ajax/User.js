const express = require('express');
const router = express.Router();

const M = require('vn-api-model');

router.post('/avatarImg', function (req, res) {
  const imgObj = {
    file: req.body.file
  };
  const user = res.locals.user;
  
  M
    .User
    .updateAvatarImg(imgObj, user)
    .then(function (result) {
      res.json('ok');
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

router.post('/noti/read', (req, res) => {
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
