const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../helper/func');

const M = require('../../Models/index');

router.post('/post/:postId', function (req, res, next) {
  const postObj = {
    postId: req.params.postId
  };
  const user = res.locals.user;
  M
    .Post
    .likePost(postObj, user)
    .then(function (post) {
      if (post) {
        res.json('ok');
      } else {
        res.json('error');
      }
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

router.post('/comment/:commentId', function (req, res, next) {
  const commentObj = {
    commentId: req.params.commentId
  };
  const user = res.locals.user;
  
  M
    .Comment
    .likeComment(commentObj, user)
    .then(function (post) {
      if (post) {
        res.json('ok');
      } else {
        res.json('error');
      }
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