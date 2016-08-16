const express = require('express');
const router = express.Router();
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

module.exports = router;
