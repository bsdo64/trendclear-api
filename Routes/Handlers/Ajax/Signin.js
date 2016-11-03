const express = require('express');
const router = express.Router();
const helper = require('../../helper/func');

const M = require('../../../vn-api-model/index');


router.post('/', function (req, res, next) {
  var newUserObj = {
    email: req.body.signinEmail,
    password: req.body.password,
    nick: req.body.signinNick,
    sex: !!req.body.sex,
    year: req.body.year,
    month: req.body.month,
    day: req.body.day,
    birth: req.body.birth
  };
  const sessionId = helper.signedSessionId(req.cookies.sessionId);

  return M
    .User
    .signin(newUserObj, sessionId)
    .then(function (result) {
      res.cookie('token', result.token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        domain: process.env.NODE_ENV==='production' ? 'venacle.com': 'localhost'
      });

      res.json({result: 'ok'});
    })
    .catch(function (err) {
      res.json({
        message: 'can\'t make token',
        error: err
      });
    });
});

// define the home page route
router.post('/checkEmailDup', function (req, res, next) {

  M
    .User
    .checkEmailDup(req.body.email)
    .then(function (dup) {

      res.status(200).json(dup);
    })
});

router.post('/checkNickDup', function (req, res, next) {

  M
    .User
    .checkNickDup(req.body.nick)
    .then(function (dup) {

      res.status(200).json(dup);
    })
});

router.post('/requestEmailVerify', function (req, res, next) {

  const sessionId = helper.signedSessionId(req.cookies.sessionId);

  M
    .User
    .requestEmailVerifyCode(req.body.email, sessionId)
    .then(function (result) {
      res.json(result);
    })
    .catch(function (err) {
      console.error(err);
      res.json({
        message: 'Can\'t verify email',
        error: err
      });
    });
});

router.post('/checkEmailCodeVerify', function (req, res, next) {
  const sessionId = helper.signedSessionId(req.cookies.sessionId);
  
    M
      .User
      .checkVerifyCode(req.body.verifyCode, sessionId)
      .then(function (result) {
        res.json(result);
      })
      .catch(function (err) {
        res.json({
          message: 'Not same verify code',
          error: err
        });
      });
});

module.exports = router;
