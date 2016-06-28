const express = require('express');
const moment = require('moment');
const router = express.Router();

const M = require('vn-api-model');
const Db = require('trendclear-database').Models;
const Noti = require('../Socket/Noti');

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

router.post('/subComment', function (req, res) {
  const commentObj = {
    content: req.body.content,
    commentId: req.body.commentId
  };
  const user = res.locals.user;
  
  M
    .Comment
    .submitSubComment(commentObj, user)
    .then(function (subComment) {

      subComment.created_at = moment(subComment.created_at).format('YYYY-MM-DD HH:mm');
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

router.post('/comment', function (req, res) {
  const commentObj = {
    content: req.body.content,
    postId: req.body.postId
  };
  const user = res.locals.user;
  
  M
    .Comment
    .submitComment(commentObj, user)
    .then(function (comment) {
      
      comment.created_at = moment(comment.created_at).format('YYYY-MM-DD HH:mm');
      comment.subComments = [];

      return Db
        .tc_posts
        .query()
        .where({id: commentObj.postId})
        .first()
        .then((post) => {
          return post
            .$relatedQuery('author')
            .first()
            .then(author => {
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
                          target_id: comment.post_id,
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
                    Noti.emitNspRoomData(req.app.notiIo, author.nick, 'comment_write noti', notis);
                    res.json(comment);
                  })
              }

              res.json(comment);
            })
        })
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

router.post('/submit', function (req, res) {
  const postObj = {
    title: req.body.title,
    content: req.body.content,
    prefixId: req.body.prefixId
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
