const express = require('express');
const router = express.Router();

const StoreHandler = require('./../Store/index');
const {
  Best,
  CheckUser,
  Point,
  Collection,
  Community,
  Forum,
  Like,
  Link,
  Login,
  Logout,
  NoCache,
  Post,
  RequestLog,
  Search,
  Setting,
  Signin,
  TimeLog,
  User,
  Validate,
  Venalink,
  VenacleStore
} = require('require-dir')();

router.use(NoCache);
router.use(RequestLog);
router.use(TimeLog.Start, CheckUser, TimeLog.End);

// Store data

router.use('/store', StoreHandler);

// Ajax fragment

router.use('/best', Best);
router.use('/collection', Collection);
router.use('/community', Community);
router.use('/forum', Forum);
router.use('/user', User);
router.use('/like', Like);
router.use('/point', Point);
router.use('/link', Link);
router.use('/login', Login);
router.use('/logout', Logout);
router.use('/post', Post);
router.use('/search', Search);
router.use('/settings', Setting);
router.use('/signin', Signin);
router.use('/validate', Validate);
router.use('/venalink', Venalink);
router.use('/venastore', VenacleStore);

module.exports = router;
