const express = require('express');
const router = express.Router();
const { moment, model } = require('util/func');
const co = require('co');

router.get('/:clubId/feed', (req, res) => {
  const props = {
    forumId: req.params.clubId,
    postId: req.query.postId,
    page: (req.query.page - 1) >= 0 ? (req.query.page - 1) : 0,
    forumSearch: req.query.forumSearch,
    forumPrefix: req.query.forumPrefix,
    user: res.locals.user
  };

  co(function*() {
    const posts = yield model.Forum.getForumPostList(props);
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
  }).catch((err) => {
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
