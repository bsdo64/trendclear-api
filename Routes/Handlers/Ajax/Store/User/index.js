const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const {model} = require('util/func');


router.get('/chargePoint', (req, res) => {
  const user = res.locals.user;

  res.json(res.resultData);
});

router.get(['/points'], (req, res) => {
  const user = res.locals.user;

  model
    .User
    .getPointAccount(user)
    .then(account => {
      assign(res.resultData, {
        UserStore: {
          account: account
        }
      });

      res.json(res.resultData);
    });
});

router.get('/points/chargeLog', (req, res) => {
  const user = res.locals.user;

  model
    .Point
    .getPaymentList(user)
    .then(list => {
      assign(res.resultData, {
        UserStore: {
          payments: list
        }
      });

      res.json(res.resultData);
    });
});

router.get(['/venalinks', '/venalinks/active'], (req, res) => {
  const user = res.locals.user;

  model
    .Venalink
    .activatedVenalinkList(user)
    .then(venalinks => {
      assign(res.resultData, {
        UserStore: {
          venalinks: venalinks
        }
      });

      res.json(res.resultData);
    });
});

router.get('/venalinks/share', (req, res) => {
  const user = res.locals.user;

  model
    .Venalink
    .participatedVenalinkList(user)
    .then(participated => {
      assign(res.resultData, {
        UserStore: {
          participatedVenalinks: participated
        }
      });

      res.json(res.resultData);
    });
});

module.exports = router;