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

router.post('/activate', (req, res) => {
  const user = res.locals.user;
  const venalinkObj = {
    total_amount_r: req.body.total_amount_r,
    terminate_at: req.body.terminate_at,
    post_id: req.body.post_id,
    activate_item_id: req.body.activate_item_id,
    active_at: req.body.active_at
  };

  M
    .Venalink
    .checkVenalinkItem(venalinkObj, user)
    .then((venalink) => {
      if (venalink) {
        res.json({
          success: true,
          venalink: venalink
        });
      } else {
        res.json({
          success: false,
          venalink: null
        });
      }
    })
    .catch(err => {
      res.json(err);
    })
});

module.exports = router;
