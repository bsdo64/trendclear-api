'use strict';

const express = require('express');
const { moment } = require('../helper/func');
const router = express.Router();

const M = require('../../vn-api-model');
const Noti = require('vn-api-client').Socket.Noti;

router.post('/post/view', (req, res) => {
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

});

router.post('/subComment', (req, res) => {
  const commentObj = {
    content: req.body.content,
    commentId: req.body.commentId
  };
  const user = res.locals.user;
  
  M
    .Comment
    .submitSubComment(commentObj, user)
    .then(function (subComment) {

      subComment.created_at = moment(subComment.created_at).fromNow();
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
});

router.put('/subComment', (req, res) => {
  const commentObj = {
    id: req.body.id,
    content: req.body.content
  };
  const user = res.locals.user;
  M
    .Comment
    .updateSubComment(commentObj, user)
    .then((comment) => {
      for (let j in comment) {
        if (j === 'created_at') {
          comment[j] = moment(comment[j]).fromNow();
        }
      }
      res.json(comment);
    });
});

router.post('/comment', (req, res) => {
  const commentObj = {
    content: req.body.content,
    postId: req.body.postId
  };
  const user = res.locals.user;

  let newComment;
  M
    .Comment
    .submitComment(commentObj, user)
    .then(function (comment) {
      newComment = comment;

      return M
        .Post
        .findOneById(commentObj.postId, 0, user)
    })
    .then((post) => {
      const author = post.author;

      post.created_at = moment(post.created_at).fromNow();

      for (let i in post.comments) {
        for (let j in post.comments[i]) {
          if (j === 'created_at') {
            post.comments[i][j] = moment(post.comments[i][j]).fromNow();
          }

          if (j === 'subComments') {
            for (let k in post.comments[i][j]) {
              for (let l in post.comments[i][j][k]) {
                if (l === 'created_at') {
                  post.comments[i][j][k][l] = moment(post.comments[i][j][k][l]).fromNow();
                }
              }
            }
          }
        }
      }

      // Noti section
      if (post && author && (author.id !== user.id)) {

        return author
          .$relatedQuery('notifications')
          .where('type', 'comment_write')
          .andWhere('target_id', post.id)
          .first()
          .then(noti => {
            if (noti) {
              return author
                .$relatedQuery('notifications')
                .update({
                  read: false,
                  count: post.comment_count,
                  receive_at: new Date()
                })
                .where('id', noti.id)
            } else {
              return author
                .$relatedQuery('notifications')
                .insert({
                  type: 'comment_write',
                  read: false,
                  target_id: newComment.post_id,
                  count: post.comment_count,
                  receive_at: new Date()
                })
            }
          })
          .then(() => {

            return author
              .$relatedQuery('notifications')
              .select('*', 'tc_user_notifications.id as id', 'tc_posts.id as post_id')
              .join('tc_posts', 'tc_posts.id', 'tc_user_notifications.target_id')
              .offset(0)
              .limit(10)
              .orderBy('receive_at', 'DESC')
          })
          .then(notis => {

            Noti.emit('send noti', {to: author.nick, notis: notis});

            res.json(post);
          })
      }

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

router.put('/comment', (req, res) => {
  const commentObj = {
    id: req.body.id,
    content: req.body.content,
    postId: req.body.postId
  };
  const user = res.locals.user;
  M
    .Comment
    .updateComment(commentObj, user)
    .then((comment) => {
      for (let j in comment) {
        if (j === 'created_at') {
          comment[j] = moment(comment[j]).fromNow();
        }
      }
      res.json(comment);
    });
});

router.post('/submit', (req, res) => {
  const postObj = {
    title: req.body.title,
    content: req.body.content,
    prefixId: req.body.prefixId,
    isAnnounce: req.body.isAnnounce,
    width: req.body.width,
    height: req.body.height,
    postImages: req.body.postImages,
    representingImage: req.body.representingImage
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

router.put('/submit', (req, res) => {
  const postObj = {
    postId: req.body.postId,
    title: req.body.title,
    content: req.body.content,
    isAnnounce: req.body.isAnnounce,
    width: req.body.width,
    height: req.body.height,
    postImages: req.body.postImages,
    representingImage: req.body.representingImage
  };
  const user = res.locals.user;

  M
    .Post
    .updatePost(postObj, user)
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
