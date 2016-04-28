const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../helper/func');

const M = require('../../Models/index');

router.use(function (req, res, next) {
  console.log(req.signedCookies);

  next();
});

router.post('/', function (req, res, next) {
  const userObj = {
    email: req.body.email,
    password: req.body.password
  };
  const sessionId = helper.signedSessionId(req.cookies.sessionId);

  return M
    .User
    .login(userObj, sessionId)
    .then(function (token) {
      console.log(token);
      res.cookie('token', token, {
        expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
        httpOnly: true
      });

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
