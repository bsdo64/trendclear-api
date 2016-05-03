const express = require('express');
const router = express.Router();
const logger = require('morgan');

const M = require('../../Models/index');
const SigninHandler = require('./Signin');
const LoginHandler = require('./Login');
const LogoutHandler = require('./Logout');
const StoreHandler = require('./Store');
const CommunityHandler = require('./Community');

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
router.use('/logout', LogoutHandler);
router.use('/community', CommunityHandler);

// define the about route
router.get('/about', function(req, res) {
  
});

module.exports = router;
