const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../helper/func');

const M = require('../../Models/index');

router.get('/', function (req, res, next) {
  const page = req.query.page - 1;
  const sessionId = helper.signedSessionId(req.cookies.sessionId);
  const token = req.cookies.token;

  return M
    .User
    .checkUserByToken(token, sessionId)
    .then((user) => M
      .Post
      .bestPostList(page, user)
    )
    .then(function (posts) {

      res.json(posts);
    })
    .catch(function (err) {
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
})

router.post('/submit', function (req, res, next) {
  const postObj = {
    title: req.body.title,
    content: req.body.content,
    prefixId: req.body.prefixId,
  };
  const sessionId = helper.signedSessionId(req.cookies.sessionId);
  const token = req.cookies.token;

  return M
    .User
    .checkUserByToken(token, sessionId)
    .then(function (user) {

      return M
        .Post
        .submitPost(postObj, user, req.body.query)
    })
    .then(function (post) {

      res.json(post);
    })
    .catch(function (err) {
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
