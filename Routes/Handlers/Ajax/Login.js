const express = require('express');
const router = express.Router();
const helper = require('../../Util/helper/func');
const co = require('co');

const M = require('../../../vn-api-model/index');

router.post('/', function (req, res) {
  const userObj = {
    email: req.body.email,
    password: req.body.password
  };
  const sessionId = helper.signedSessionId(req.cookies.sessionId);

  co(function* RouterHandler() {
    const token = yield M.User.login(userObj, sessionId);
    res.cookie('token', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      domain: process.env.NODE_ENV==='production' ? 'venacle.com': 'localhost'
    });

    res.json('ok');
  }).catch(function (err) {
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

module.exports = router;
