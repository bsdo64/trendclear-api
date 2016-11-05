const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const M = require('../../../../vn-api-model');
const {moment} = require('../../../Util/helper/func');
const _ = require('lodash');

_.mixin(require('lodash-deep'));

router.get('/:collectionId', function (req, res, next) {
  const props = {
    collectionId : req.params.collectionId,
    user : res.locals.user,
    page: 0,
    order: req.query.order
  };

  M
    .Collection
    .getCollectionPosts(props)
    .then(posts => {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).fromNow();
          }
        }
      }

      res.json({
        GnbStore: res.resultData.GnbStore,
        LoginStore: res.resultData.LoginStore,
        UserStore: res.resultData.UserStore,
        CollectionBestPostStore: {
          posts: {
            data: posts.results,
            collection: {
              current_page: 1,
              limit: 10,
              next_page: (posts.total > 10) ? 2 : null,
              total: posts.total
            }
          }
        },
        ReportStore: res.resultData.ReportStore,
        ListStore: res.resultData.ListStore,
        AuthStore: res.resultData.AuthStore
      })
    });
});

router.get('/', function (req, res, next) {
  res.redirect('/');
});

module.exports = router;