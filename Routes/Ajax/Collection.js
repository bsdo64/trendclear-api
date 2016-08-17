const express = require('express');
const router = express.Router();
const moment = require('moment');
const helper = require('../helper/func');

const M = require('../../vn-api-model');

router.get('/', function (req, res) {
  const user = res.locals.user;

  M
    .Collection
    .getUserCollections(user)
    .then(collections => {
      res.json(collections);
    })
});

router.post('/', function (req, res) {
  const collectionObj = {
    title: req.body.title,
    password: req.body.description,
    isPrivate: req.body.isPrivate,
  };
  const user = res.locals.user;

  M
    .Collection
    .createCollection({
      title: collectionObj.title,
      password: collectionObj.description,
      isPrivate: collectionObj.isPrivate,
      creator_id: user.id
    })
    .then(collection => {
      res.json(collection);
    })
});

router.get('/:id', function (req, res) {
  const collectionId = req.params.id;
  const user = res.locals.user;

  M
    .Collection
    .getCollectionById(collectionId, user)
    .first()
    .then(collections => {
      res.json(collections);
    })
});

router.put('/:id', function (req, res) {
  const collectionId = req.params.id;
  const collectionObj = {
    title: req.body.title,
    password: req.body.description,
    isPrivate: req.body.isPrivate,
  };
  const user = res.locals.user;

  M
    .Collection
    .updateCollection(collectionId, {
      title: collectionObj.title,
      password: collectionObj.description,
      isPrivate: collectionObj.isPrivate,
      creator_id: user.id
    })
    .then(updatedCollection => {
      res.json(updatedCollection);
    })
});

router.delete('/:id', function (req, res) {
  const collectionId = req.params.id;
  const user = res.locals.user;

  M
    .Collection
    .deleteCollection(collectionId, user)
    .then(numDeleted => {
      if (numDeleted) {
        res.json('ok');
      } else {
        res.json(false);
      }
    })
});

router.get('/:collectionId/forum', function (req, res) {
  const collectionId = req.params.collectionId;
  const user = res.locals.user;

  M
    .Collection
    .getForums(collectionId)
    .then(forums => {
      res.json(forums);
    })
});

router.post('/:collectionId/forum', function (req, res) {
  const collectionId = req.params.collectionId;
  const forumId = req.body.forumId;

  M
    .Collection
    .addForum(collectionId, forumId)
    .then(forums => {
      res.json(forums);
    })
});

router.delete('/:collectionId/forum/:forumId', function (req, res) {
  const collectionId = req.params.collectionId;
  const forumId = req.params.forumId;

  M
    .Collection
    .removeForum(collectionId, forumId)
    .then(forums => {
      res.json(forums);
    })
});

router.get('/:collectionId/posts', function (req, res) {
  const collectionId = req.params.collectionId;
  const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) - 1 : 0;
  const user = res.locals.user;

  M
    .Collection
    .getCollectionPosts(collectionId, page, user)
    .then(function (posts) {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      const limit = 10;
      const nextPage = page + 1;
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

module.exports = router;
