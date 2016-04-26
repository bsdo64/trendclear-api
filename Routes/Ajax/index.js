const express = require('express');
const router = express.Router();

const M = require('../../Models/index');
const SigninHandler = require('./Signin');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());

  console.log('query: ', req.query);
  console.log('body: ', req.body);

  next();
});
// define the home page route
router.use('/signin', SigninHandler);

// define the about route
router.get('/about', function(req, res) {
  res.send('About birds');
});

module.exports = router;
