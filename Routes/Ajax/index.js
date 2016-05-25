const express = require('express');
const router = express.Router();
const logger = require('morgan');
const {signedSessionId} = require('../helper/func');

const CheckUser = require('./CheckUser');

const SigninHandler = require('./Signin');
const LoginHandler = require('./Login');
const LogoutHandler = require('./Logout');
const StoreHandler = require('./Store');
const CommunityHandler = require('./Community');
const BestHandler = require('./Best');
const UserHandler = require('./User');
const LikeHandler = require('./Like');
const SearchHandler = require('./Search');

router.use(logger('dev'));

router.use(function timeLog(req, res, next) {
  console.log();
  console.log('Time: ', Date.now());

  console.log('sessionId: ', signedSessionId(req.cookies.sessionId));
  console.log('query: ', req.query);
  console.log('body: ', req.body);

  next();
});

router.use(CheckUser);

router.use('/store', StoreHandler);

// define the home page route
router.use('/signin', SigninHandler);
router.use('/login', LoginHandler);
router.use('/logout', LogoutHandler);
router.use('/community', CommunityHandler);
router.use('/best', BestHandler);
router.use('/user', UserHandler);
router.use('/like', LikeHandler);
router.use('/search', SearchHandler);

// define the about route
router.get('/about', function(req, res) {
  
});

module.exports = router;
