const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const {model} = require('util/func');

router.get(['/', '/profile'], (req, res, next) => {
  const user = res.locals.user;

  model
    .User
    .getActivityMeta(user)
    .then((meta) => {
      assign(res.resultData, {
        ActivityStore: {
          meta: meta
        }
      });

      res.json(res.resultData);
    })
    .catch(err => {
      next(err);
    });

});

router.use('/activity', require('./Activity.js'));

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

      account.current_page = 1;
      account.limit = 20;

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

      list.current_page = 1;
      list.limit = 20;

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
  const nextPage = 1;
  const limit = 10;

  model
    .Venalink
    .makeQuery('tc_venalinks', {
      page: nextPage,
      limit: limit,
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

      res.resultData.listStores.lists = res.resultData.listStores.lists || [];
      res.resultData.listStores.lists = res.resultData.listStores.lists.concat([
        {
          listName: 'userVenalinks',
          itemSchema: 'venalink',
          data: list,
          collection: {
            current_page: nextPage,
            limit: limit,
            next_page: (limit * nextPage < list.total) ? (nextPage + 1) : null,
            total: list.total
          }
        }
      ]);

      res.json(res.resultData);
    });
});

router.get('/venalinks/share', (req, res) => {
  const user = res.locals.user;
  const nextPage = 1;
  const limit = 10;

  model
    .Venalink
    .makeQuery('tc_user_has_venalinks', {
      page: 1,
      limit: limit,
      where: { user_id: user.id },
      eager: ['venalink.participants'],
      order: {
        column: 'request_at',
        direction: 'DESC'
      }
    })
    .then(list => {
      assign(res.resultData, {
        UserStore: {
          participatedVenalinks: list
        }
      });


      res.resultData.listStores.lists = res.resultData.listStores.lists || [];
      res.resultData.listStores.lists = res.resultData.listStores.lists.concat([
        {
          listName: 'userParticipatedVenalinks',
          itemSchema: 'participatedVenalinks',
          data: list,
          collection: {
            current_page: nextPage,
            limit: limit,
            next_page: (limit * nextPage < list.total) ? (nextPage + 1) : null,
            total: list.total
          }
        }
      ]);

      res.json(res.resultData);
    });
});

module.exports = router;