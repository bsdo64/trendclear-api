const express = require('express');
const router = express.Router();
const helper = require('../../Util/helper/func');
const co =  require('co');

const M = require('../../../vn-api-model/index');

const ErrorHandler = (req, res) => {
  return (err) => {
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
  };
};

router.post('/post/:postId', (req, res) => {
  const postObj = {
    postId: req.params.postId
  };
  const user = res.locals.user;

  co(function*() {
    const postLike = yield M.Post.likePost(postObj, user);
    if (postLike) {
      if (postLike === 1) {
        res.json('ok');
      } else {
        res.json('nc')
      }
    } else {
      res.json('error');
    }
  }).catch(ErrorHandler(req, res))
});

router.post('/comment/:commentId', (req, res) => {
  const commentObj = {
    commentId: req.params.commentId
  };
  const user = res.locals.user;

  co(function* () {
    const commentLike = yield M.Comment.likeComment(commentObj, user);
    if (commentLike) {
      if (commentLike === 1) {
        res.json('ok');
      } else {
        res.json('nc');
      }
    } else {
      res.json('error');
    }
  }).catch(ErrorHandler(req, res));
});

router.post('/subComment/:subCommentId', (req, res) => {
  const commentObj = {
    subCommentId: req.params.subCommentId
  };
  const user = res.locals.user;

  co(function* () {
    const subCommentLike = yield M.Comment.likeSubComment(commentObj, user);
    if (subCommentLike) {

      if (subCommentLike === 1) {
        res.json('ok');
      } else {
        res.json('nc');
      }

    } else {
      res.json('error');
    }
  }).catch(ErrorHandler(req, res));
});

module.exports = router;