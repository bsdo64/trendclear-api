const express = require('express');
const router = express.Router();
const { model } = require('util/func');
const co =  require('co');



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

router.post('/post', (req, res) => {
  const postObj = {
    postId: req.body.postId
  };
  const user = res.locals.user;

  co(function*() {
    const postLike = yield model.Post.likePost(postObj, user);
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

router.post('/comment', (req, res) => {
  const commentObj = {
    commentId: req.body.commentId
  };
  const user = res.locals.user;

  co(function* () {
    const commentLike = yield model.Comment.likeComment(commentObj, user);
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

router.post('/subComment', (req, res) => {
  const commentObj = {
    subCommentId: req.body.subCommentId
  };
  const user = res.locals.user;

  co(function* () {
    const subCommentLike = yield model.Comment.likeSubComment(commentObj, user);
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