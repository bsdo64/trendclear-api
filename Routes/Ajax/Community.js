const express = require('express');
const moment = require('moment');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../helper/func');

const M = require('../../Models/index');

router.post('/post/view', (req, res, next) => {
  const viewObj = {
    postId: req.body.postId
  };
  const user = res.locals.user;

  M
    .Post
    .incrementView(viewObj, user)
    .then((post) => {
      res.json(post);
    })

})

router.post('/subComment', function (req, res, next) {
  const commentObj = {
    content: req.body.content,
    commentId: req.body.commentId
  };
  const user = res.locals.user;
  
  M
    .Comment
    .submitSubComment(commentObj, user)
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
  const user = res.locals.user;
  
  M
    .Comment
    .submitComment(commentObj, user)
    .then(function (comment) {
      
      comment.created_at = moment(comment.created_at).format('YYYY-MM-DD HH:mm')
      comment.subComments = [];

      req.app.notiIo['to'](user.nick).emit('news', comment);

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
  const user = res.locals.user;
  
  M
    .Post
    .submitPost(postObj, user, req.body.query)
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
