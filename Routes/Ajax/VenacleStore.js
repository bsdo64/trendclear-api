const express = require('express');
const router = express.Router();
const helper = require('../helper/func');

const M = require('../../vn-api-model');

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

  M
    .VenacleStore
    .purchaseItem(itemObj, user)
    .spread((account, inventories, trendbox) => {
      res.json({
        account: account,
        inventories: inventories,
        trendbox: trendbox,
      });
    })
    .catch(err => {
      res.json(err);
    })
});

module.exports = router;
