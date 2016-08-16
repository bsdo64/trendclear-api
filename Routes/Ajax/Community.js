'use strict';

const express = require('express');
const moment = require('moment');
const router = express.Router();

const M = require('../../vn-api-model');
const Noti = require('vn-api-client').Noti;

// router.post('/category', (req, res) => {
//   const {club, categoryGroup, category, forum} = req.body;
//   const categoryObj = {club, categoryGroup, category, forum};
//   const user = res.locals.user;
//
//   if (club.id && categoryGroup.id && category.id) {
//     // create forum
//     Db
//       .tc_forums
//       .query()
//       .insert({
//         title: forum.value,
//         order: 1,
//         using: 1,
//         description: forum.value,
//         club_id: club.id,
//         club_category_group_id: categoryGroup.id,
//         category_id: category.id,
//       })
//       .then(result => {
//         res.json(result)
//       })
//   }
//
//   if (club.id && categoryGroup.id && !category.id) {
//     // create category, forum
//     Db
//       .tc_club_categories
//       .query()
//       .insertWithRelated({
//         '#id': 'c1',
//         title: category.value,
//         order: 0,
//         using: 1,
//         description: category.value,
//         club_id: club.id,
//         club_category_group_id: categoryGroup.id,
//         forums: [
//           {
//             title: forum.value,
//             order: 0,
//             using: 1,
//             description: forum.value,
//             club_id: club.id,
//             club_category_group_id: categoryGroup.id,
//             category_id: '#ref{c1.id}'
//           }
//         ]
//       })
//       .then(result => {
//         res.json(result)
//       })
//   }
//
//   if (club.id && !categoryGroup.id && !category.id) {
//     // create category, forum, categoryGroup
//     Db
//       .tc_club_category_groups
//       .query()
//       .insertWithRelated({
//         '#id': 'cg1',
//         title: categoryGroup.value,
//         order: 0,
//         using: 1,
//         description: categoryGroup.value,
//         club_id: club.id,
//         categories: {
//           '#id': 'c1',
//           title: category.value,
//           order: 0,
//           using: 1,
//           description: category.value,
//           club_id: club.id,
//           club_category_group_id: '#ref{cg1.id}',
//           forums: [
//             {
//               title: forum.value,
//               order: 0,
//               using: 1,
//               description: forum.value,
//               club_id: club.id,
//               club_category_group_id: '#ref{cg1.id}',
//               category_id: '#ref{c1.id}'
//             }
//           ]
//         }
//       })
//       .then(result => {
//         res.json(result)
//       })
//   }
// });

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

      post.created_at = moment(post.created_at).format('YYYY-MM-DD HH:mm');

      for (let i in post.comments) {
        for (let j in post.comments[i]) {
          if (j === 'created_at') {
            post.comments[i][j] = moment(post.comments[i][j]).format('YYYY-MM-DD HH:mm');
          }

          if (j === 'subComments') {
            for (let k in post.comments[i][j]) {
              for (let l in post.comments[i][j][k]) {
                if (l === 'created_at') {
                  post.comments[i][j][k][l] = moment(post.comments[i][j][k][l]).format('YYYY-MM-DD HH:mm');
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

router.put('/submit', function (req, res) {
  const postObj = {
    postId: req.body.postId,
    title: req.body.title,
    content: req.body.content
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
