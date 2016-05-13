const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../helper/func');

const M = require('../../Models/index');

router.use(function (req, res, next) {
  console.log(req.signedCookies);

  next();
});

router.post('/avatarImg', function (req, res, next) {
  const imgObj = {
    file: req.body.file
  };
  const sessionId = helper.signedSessionId(req.cookies.sessionId);
  const token = req.cookies.token;

  return M
    .User
    .checkUserByToken(token, sessionId)
    .then(function (user) {

      return M
        .User
        .updateAvatarImg(imgObj, user)
    })
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

module.exports = router;
