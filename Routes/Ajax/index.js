const express = require('express');
const router = express.Router();
const {signedSessionId} = require('../helper/func');

const CheckUserHandler = require('./CheckUser');

const SigninHandler = require('./Signin');
const CollectionHandler = require('./Collection');
const LoginHandler = require('./Login');
const LogoutHandler = require('./Logout');
const StoreHandler = require('./Store');
const CommunityHandler = require('./Community');
const BestHandler = require('./Best');
const UserHandler = require('./User');
const LikeHandler = require('./Like');
const ForumHandler = require('./Forum');
const SearchHandler = require('./Search');
const SettingHandler = require('./Setting');

const now = require('performance-now');

let start;
function startTime(req, res, next) {
  "use strict";
  start = now();

  next();
}

function endTime(req, res, next) {
  "use strict";

  let end = now();
  console.log((end-start).toFixed(3));

  next();
}

router.use(function timeLog(req, res, next) {

  console.log();

  console.log('sessionId: ', signedSessionId(req.cookies.sessionId));
  console.log('query: ', req.query);
  console.log('body: ', req.body);

  next();
});

router.use(startTime, CheckUserHandler, endTime);

router.use('/store', StoreHandler);

// define the home page route
router.use('/signin', SigninHandler);
router.use('/collection', CollectionHandler);
router.use('/login', LoginHandler);
router.use('/logout', LogoutHandler);
router.use('/community', CommunityHandler);
router.use('/best', BestHandler);
router.use('/user', UserHandler);
router.use('/like', LikeHandler);
router.use('/forum', ForumHandler);
router.use('/search', SearchHandler);
router.use('/settings', SettingHandler);

// define the about route
router.get('/about', function(req, res) {
  
});

module.exports = router;
