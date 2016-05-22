const express = require('express');
const moment = require('moment');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../helper/func');

const M = require('../../Models/index');

router.post('/subComment', function (req, res, next) {
  const commentObj = {
    content: req.body.content,
    commentId: req.body.commentId
  };
  const sessionId = helper.signedSessionId(req.cookies.sessionId);
  const token = req.cookies.token;

  return M
    .User
    .checkUserByToken(token, sessionId)
    .then(function (user) {

      return M
        .Comment
        .submitSubComment(commentObj, user)
    })
    .then(function (subComment) {

      subComment.created_at = moment(subComment.created_at).format('YYYY-MM-DD HH:mm')
      subComment.commentId = commentObj.commentId;
      res.json(subComment);
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

router.post('/comment', function (req, res, next) {
  const commentObj = {
    content: req.body.content,
    postId: req.body.postId
  };
  const sessionId = helper.signedSessionId(req.cookies.sessionId);
  const token = req.cookies.token;

  return M
    .User
    .checkUserByToken(token, sessionId)
    .then(function (user) {

      return M
        .Comment
        .submitComment(commentObj, user)
    })
    .then(function (comment) {

      comment.created_at = moment(comment.created_at).format('YYYY-MM-DD HH:mm')
      res.json(comment);
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
