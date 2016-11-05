const express = require('express');
const router = express.Router();
const helper = require('../../Util/helper/func');

const M = require('../../../vn-api-model/index');

router.post('/', function (req, res) {
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
