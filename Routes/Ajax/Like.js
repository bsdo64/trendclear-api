const express = require('express');
const router = express.Router();
const helper = require('../helper/func');

const M = require('vn-api-model');

router.post('/post/:postId', function (req, res) {
  const postObj = {
    postId: req.params.postId
  };
  const user = res.locals.user;
  M
    .Post
    .likePost(postObj, user)
    .then(function (postLike) {
      if (postLike) {
        if (postLike === 1) {
          res.json('ok');
        } else {
          res.json('nc')
        }
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

router.post('/comment/:commentId', function (req, res) {
  const commentObj = {
    commentId: req.params.commentId
  };
  const user = res.locals.user;
  
  M
    .Comment
    .likeComment(commentObj, user)
    .then(function (commentLike) {
      if (commentLike) {
        if (commentLike === 1) {
          console.log('commentLike : ', commentLike);
          res.json('ok');
        } else {
          res.json('nc');
        }
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

router.post('/subComment/:subCommentId', function (req, res) {
  const commentObj = {
    subCommentId: req.params.subCommentId
  };
  const user = res.locals.user;

  M
    .Comment
    .likeSubComment(commentObj, user)
    .then(function (subCommentLike) {
      if (subCommentLike) {

        if (subCommentLike === 1) {
          res.json('ok');
        } else {
          res.json('nc');
        }
        
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