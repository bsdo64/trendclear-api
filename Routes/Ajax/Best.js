const express = require('express');
const router = express.Router();
const moment = require('moment');
const helper = require('../helper/func');

const M = require('../../Models/index');

router.get('/', function (req, res, next) {
  const page = req.query.page - 1;
  const user = res.locals.user;

  return M
    .Post
    .bestPostList(page, user)
    .then(function (posts) {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

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
