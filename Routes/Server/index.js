"use strict";

const express = require('express');
const router = express.Router();
const Models = require('../../Models');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', function(req, res) {
  Models
    .User
    .signin()
    .then(function() {
      res.send('Hello world')
    });
});
// define the about route
router.get('/about', function(req, res) {
  res.send('About birds');
});

module.exports = router;
