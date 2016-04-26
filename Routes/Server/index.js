"use strict";

const express = require('express');
const router = express.Router();

const M = require('../../Models/index');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', function(req, res) {
  M
    .User
    .signin()
    .then(function (user) {
      res.send(user);
    })
});
// define the about route
router.get('/about', function(req, res) {
  res.send('About birds');
});

module.exports = router;
