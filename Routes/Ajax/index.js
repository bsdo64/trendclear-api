const express = require('express');
const router = express.Router();

const M = require('../../Models/index');
const SigninHandler = require('./Signin');
const StoreHandler = require('./Store');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());

  console.log('query: ', req.query);
  console.log('body: ', req.body);

  next();
});

router.use('/store', StoreHandler);

// define the home page route
router.use('/signin', SigninHandler);

// define the about route
router.get('/about', function(req, res) {
  
});

module.exports = router;
