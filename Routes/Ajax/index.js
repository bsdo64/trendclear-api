const express = require('express');
const router = express.Router();
const logger = require('morgan');

const M = require('../../Models/index');
const SigninHandler = require('./Signin');
const LoginHandler = require('./Login');
const StoreHandler = require('./Store');

router.use(logger('dev'));
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());

  console.log('query: ', req.query);
  console.log('query: ', req.query);
  console.log('body: ', req.body);

  next();
});

router.use('/store', StoreHandler);

// define the home page route
router.use('/signin', SigninHandler);
router.use('/login', LoginHandler);

// define the about route
router.get('/about', function(req, res) {
  
});

module.exports = router;
