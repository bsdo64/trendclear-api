const express = require('express');
const router = express.Router();
const helper = require('../../Util/helper/func');
const co = require('co');

const M = require('../../../vn-api-model/index');

router.get('/', (req, res) => {
  const user = res.locals.user;

  M
    .VenacleStore
    .getItems()
    .then(items => {
      res.json({items: items});
    })
});

router.post('/purchase/item', (req, res) => {
  const user = res.locals.user;
  const itemObj = {
    id: req.body.id,
    code: req.body.code
  };

  co(function* Handler() {
    const [account, inventories, trendbox] = yield M.VenacleStore.purchaseItem(itemObj, user);
    res.json({
      account: account,
      inventories: inventories,
      trendbox: trendbox,
    });
  }).catch(err => {
    res.json(err);
  });
});

module.exports = router;
