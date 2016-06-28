const express = require('express');
const router = express.Router();
const moment = require('moment');
const helper = require('../helper/func');

const M = require('vn-api-model');

router.get('/', function (req, res) {
  const searchObj = {
    query: req.params.query
  };
  const user = res.locals.user;

  M
    .Post
    .bestPostList(searchObj, user)
    .then(function (posts) {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      if (posts) {
        res.json(posts);
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