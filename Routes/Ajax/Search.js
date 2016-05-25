const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../helper/func');

const M = require('../../Models/index');

router.get('/', function (req, res, next) {
  const searchObj = {
    query: req.params.query
  };
  const user = res.locals.user;
  
  M
    .Post
    .bestPostList(searchObj, user)
    .then(function (post) {
      if (post) {
        res.json(post);
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