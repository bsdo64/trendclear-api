const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const M = require('../../../../vn-api-model');

router.get('/chargePoint', (req, res) => {
  const user = res.locals.user;

  res.json(res.resultData);
});

router.get(['/points'], (req, res) => {
  const user = res.locals.user;

  M
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

  M
    .Point
    .getPaymentList({
      page: 0,
      limit: 20,
      where: {
        user_id: user.id
      },
      order: {
        column: 'id',
        direction: 'ASC'
      }
    })
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

  M
    .Venalink
    .makeQuery('tc_venalinks', {
      page: 0,
      limit: 20,
      where: { user_id: user.id },
      eager: ['participants'],
      order: {
        column: 'active_at',
        direction: 'DESC'
      }
    })
    .then(list => {
      assign(res.resultData, {
        UserStore: {
          venalinks: list
        }
      });

      res.json(res.resultData);
    });
});

router.get('/venalinks/share', (req, res) => {
  const user = res.locals.user;

  M
    .Venalink
    .makeQuery('tc_user_has_venalinks', {
      page: 0,
      limit: 20,
      where: { user_id: user.id },
      eager: ['venalink.participants'],
      order: {
        column: 'request_at',
        direction: 'DESC'
      }
    })
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