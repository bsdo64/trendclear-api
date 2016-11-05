const express = require('express');
const router = express.Router();
const { moment } = require('../../Util/helper/func');
const co = require('co');
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
  }
};

router.get('/', (req, res) => {
  const props = {
    page: req.query.page ? req.query.page - 1 : 0,
    user: res.locals.user,
    forumIds: req.query.categoryValue,
    listType: req.query.listType
  };

  co(function*() {
    const posts = yield M.Post.bestPostList(props);
    const limit = 10;
    const nextPage = props.page + 1;

    posts.results = posts.results.map(post => {
      if (post.created_at) {
        post.created_at = moment(post.created_at).fromNow();
      }
      return post;
    });

    res.json({
      data: posts.results,
      collection: {
        current_page: nextPage,
        limit: limit,
        next_page: (limit * nextPage < posts.total) ? (nextPage + 1) : null,
        total: posts.total
      }
    });
  }).catch(ErrorHandler(req, res));
});

router.post('/submit', (req, res) => {
  const postObj = {
    title: req.body.title,
    content: req.body.content,
    prefixId: req.body.prefixId
  };
  const user = res.locals.user;

  co(function*() {
    res.json(yield M.Post.submitPost(postObj, user, req.body.query));
  }).catch(ErrorHandler(req, res));
});

module.exports = router;
