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
  const sessionId = helper.signedSessionId(req.cookies.sessionId);

  return M
    .User
    .logout(null, sessionId)
    .then(function (token) {
      res.clearCookie('token');
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
