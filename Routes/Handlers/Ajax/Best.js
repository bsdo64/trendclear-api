const express = require('express');
const router = express.Router();
const { moment } = require('../../helper/func');

const M = require('../../../vn-api-model/index');

router.get('/', function (req, res) {
  const props = {
    page: req.query.page ? req.query.page - 1 : 0,
    user: res.locals.user,
    forumIds: req.query.categoryValue,
    listType: req.query.listType
  };

  return M
    .Post
    .bestPostList(props)
    .then(function (posts) {

      posts.results = posts.results.map(post => {
        if (post.created_at) {
          post.created_at = moment(post.created_at).fromNow();
        }
        return post;
      });

      const limit = 10;
      const nextPage = props.page + 1;
      const data = {
        data: posts.results,
        collection: {
          current_page: nextPage,
          limit: limit,
          next_page: (limit * nextPage < posts.total) ? (nextPage + 1) : null,
          total: posts.total
        }
      };
      
      res.json(data);
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