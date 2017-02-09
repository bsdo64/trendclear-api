const express = require('express');
const router = express.Router();
const { model } = require('util/func');
const co = require('co');

router.get('/', (req, res) => {
  const user = res.locals.user;

  model
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
    const [account, inventories, trendbox] = yield model.VenacleStore.purchaseItem(itemObj, user);
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
