const express = require('express');
const router = express.Router();
const helper = require('../helper/func');

const Db = require('trendclear-database').Models;
const M = require('vn-api-model');

router.post('/', function (req, res) {
  const userObj = {
    title: req.body.title,
    password: req.body.description,
    isPrivate: req.body.isPrivate,
  };
  const user = res.locals.user;

  Db
    .tc_collections
    .query()
    .insert({
      title: userObj.title,
      password: userObj.description,
      isPrivate: userObj.isPrivate,
      creator: user.id
    })
    .then(collection => {
      res.json(collection);
    })
});

module.exports = router;
