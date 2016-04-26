"use strict";

const express = require('express');
const router = express.Router();
const Models = require('../../Models');

const M = require('../../Models/index');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', function(req, res) {
<<<<<<< HEAD
  Models
    .User
    .signin()
    .then(function() {
      res.send('Hello world')
    });
=======

  M
    .User
    .signin()
    .then(function (user) {
      res.send(user);
    })
>>>>>>> 4a0c7504d9eecf48429e2cf8d3a2645fe77cd13e
});
// define the about route
router.get('/about', function(req, res) {
  res.send('About birds');
});

module.exports = router;
