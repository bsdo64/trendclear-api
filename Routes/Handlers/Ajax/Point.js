const router = require('express').Router();
const co = require('co');
const M = require('../../../vn-api-model/index');

router.post('/noti', (req, res) => {
  const user = res.locals.user;

  co(function* RouteHandler() {

    console.log(req.body);
    console.log(res);

    res.json(req.body);
  });
});

module.exports = router;
