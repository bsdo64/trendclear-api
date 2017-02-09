const express = require('express');
const router = express.Router();

const StoreHandler = require('./Store/index');
const {
  Best,
  Point,
  Collection,
  Community,
  Forum,
  Like,
  Link,
  Login,
  Logout,
  Post,
  Search,
  Setting,
  Signin,
  User,
  Validate,
  Venalink,
  VenacleStore,
} = require('require-dir')();
const {
  CheckUser,
  TimeLog,
  NoCache,
  RequestLog,
} = require('require-dir')('./middleware');

const logTimer = new TimeLog('CheckUser');

router.use(NoCache);
router.use(RequestLog);
router.use(logTimer.startRouteHandler, CheckUser, logTimer.endRouteHandler);

// Store data

router.use('/store', StoreHandler);

// Ajax fragment

router.use('/best', Best);
router.use('/collection', Collection);
router.use('/community', Community);
router.use('/forum', Forum);
router.use('/like', Like);
router.use('/link', Link);
router.use('/login', Login);
router.use('/logout', Logout);
router.use('/point', Point);
router.use('/post', Post);
router.use('/search', Search);
router.use('/settings', Setting);
router.use('/signin', Signin);
router.use('/user', User);
router.use('/validate', Validate);
router.use('/venalink', Venalink);
router.use('/venastore', VenacleStore);

module.exports = router;
