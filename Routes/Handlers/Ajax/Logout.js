const express = require('express');
const router = express.Router();
const { signedSessionId, model } = require('util/func');

router.post('/', function (req, res) {
  const sessionId = signedSessionId(req.cookies.sessionId);

  return model
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
