const express = require('express');
const router = express.Router();
const { moment } = require('../../Util/helper/func');
const co = require('co');

const M = require('../../../vn-api-model/index');

router.get('/', (req, res) => {
  const user = res.locals.user;

  co(function*() {
    res.json(yield M.Collection.getUserCollections(user));
  })
});

router.post('/', (req, res) => {
  const collectionObj = {
    title: req.body.title,
    password: req.body.description,
    isPrivate: req.body.isPrivate,
  };
  const user = res.locals.user;

  co(function*() {
    res.json(yield M.Collection.createCollection({
        title: collectionObj.title,
        password: collectionObj.description,
        isPrivate: collectionObj.isPrivate,
        creator_id: user.id
    }));
  });
});

router.get('/:id', (req, res) => {
  const collectionId = req.params.id;
  const user = res.locals.user;

  co(function*() {
    res.json(yield M.Collection.getCollectionById(collectionId, user))
  })
});

router.put('/:id', (req, res) => {
  const collectionId = req.params.id;
  const collectionObj = {
    title: req.body.title,
    password: req.body.description,
    isPrivate: req.body.isPrivate,
  };
  const user = res.locals.user;

  co(function*() {
    res.json(yield M.Collection.updateCollection(collectionId, {
        title: collectionObj.title,
        password: collectionObj.description,
        isPrivate: collectionObj.isPrivate,
        creator_id: user.id
    }));
  })
});

router.delete('/:id', (req, res) => {
  const collectionId = req.params.id;
  const user = res.locals.user;

  co(function*() {
    const numDeleted = yield M.Collection.deleteCollection(collectionId, user);
    if (numDeleted) {
      res.json('ok');
    } else {
      res.json(false);
    }
  })
});

router.get('/:collectionId/forum', (req, res) => {
  const collectionId = req.params.collectionId;

  co(function*() {
    res.json(yield M.Collection.getForums(collectionId));
  })
});

router.post('/:collectionId/forum', (req, res) => {
  const collectionId = req.params.collectionId;
  const forumId = req.body.forumId;

  co(function*() {
    res.json(yield M.Collection.addForum(collectionId, forumId));
  })
});

router.delete('/:collectionId/forum/:forumId', (req, res) => {
  const collectionId = req.params.collectionId;
  const forumId = req.params.forumId;

  co(function*() {
    res.json(yield M.Collection.removeForum(collectionId, forumId));
  })
});

router.get('/:collectionId/posts', (req, res) => {
  const props = {
    collectionId: req.params.collectionId,
    page: parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) - 1 : 0,
    user: res.locals.user,
    order: req.query.order
  };

  co(function*() {
    const posts = yield M.Collection.getCollectionPosts(props);
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
