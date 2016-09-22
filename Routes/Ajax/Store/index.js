const express = require('express');
const Promise = require('bluebird');
const router = express.Router();
const assign = require('deep-assign');
const M = require('../../../vn-api-model');
const {moment} = require('../../helper/func');
const _ = require('lodash');

_.mixin(require('lodash-deep'));

router.use( function (req, res, next) {

  return M
    .Forum
    .Db
    .tc_categories
    .query()
    .where({type: 'venacle'})
    .eager('[forums]')
    .then(function(categories) {


      assign(res.resultData, {
        GnbStore: {
          openGnb: false,
          gnbMenu: { openSideNow: null, data: categories },
          categoryMenu: {}
        }
      });

      return Promise.all([
        M
          .Forum
          .getList({
            order: {
              column: 'created_at',
              direction: 'DESC'
            },
            page: 1,
            limit: 50,
            eager: '[prefixes, creator.profile]'
          }),
        M
          .Forum
          .getHotList({
            order: {
              column: 'created_at',
              direction: 'DESC'
            },
            page: 1,
            limit: 50,
            eager: '[prefixes, creator.profile]'
          })
      ])
    })
    .spread(function (newForums, hotForums) {

      assign(res.resultData, {
        GnbStore: {
          newForums: {
            data: newForums.results,
            collection: {
              current_page: 1,
              limit: 50,
              next_page: (newForums.total > 10) ? 2 : null,
              total: newForums.total
            }
          },
          hotForums: {
            data: hotForums.results,
            collection: {
              current_page: 1,
              limit: 50,
              next_page: (hotForums.total > 10) ? 2 : null,
              total: hotForums.total
            }
          }
        },
        ReportStore: {
          openReportModal: false,
          reportItem: [
            {
              id: 1,
              message: '불쾌하거나 흥미없는 내용입니다.'
            },
            {
              id: 2,
              message: '스팸성 글입니다.'
            },
            {
              id: 3,
              message: '인신공격, 불법, 허위 내용을 유포하고 있습니다.'
            }
          ],
          selectItem: 1,
          successReport: false
        },
        ListStore: {}
      });

    })
    .then(function() {
      if (req.query.postId && req.query.forumId) {
        return M
          .Forum
          .getForumInfo(req.query.forumId)
          .then(function (forum) {

            for (let i in forum.announces) {
              for (let j in forum.announces[i]) {
                if (j === 'created_at') {
                  forum.announces[i][j] = moment(forum.announces[i][j]).fromNow();
                }
              }
            }

            assign(res.resultData, {
              CommunityStore: {
                forum: forum
              }
            });

            next();
          })
      } else if (req.query.forumId) {
        return M
          .Forum
          .getForumInfo(req.query.forumId)
          .then(function (forum) {

            for (let i in forum.announces) {
              for (let j in forum.announces[i]) {
                if (j === 'created_at') {
                  forum.announces[i][j] = moment(forum.announces[i][j]).fromNow();
                }
              }
            }

            assign(res.resultData, {
              CommunityStore: {
                forum: forum
              }
            });

            return M
              .Forum
              .getForumPostList(req.query)
          })
          .then(function (result) {
            
            next();
          })
          .catch(function (err) {

            assign(res.resultData, {
              CommunityStore: {
                forum: null
              }
            });

            console.error(err.message);
            next();
          })

      } else {
        next();
      }
    })
});

router.get('/', function (req, res, next) {
  const props = {
    user: res.locals.user,
    page: req.query.page || 0
  };

  M
    .Post
    .bestPostList(props)
    .then(function (posts) {

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
        BestPostStore: {
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

router.get('/all', function (req, res, next) {
  const props = {
    user: res.locals.user,
    page: req.query.page || 0,
    listType: 'all'
  };

  M
    .Post
    .bestPostList(props)
    .then(function (posts) {

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
        BestPostStore: {
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

router.use('/collection', require('./Collection'));
router.use('/community', require('./Community'));
router.use('/activity', require('./Activity'));

router.get('/signin', function (req, res, next) {

  res.json({
    GnbStore: {
      openGnb: false,
      gnbMenu: res.resultData.GnbStore.gnbMenu,
      categoryMenu: {
        categories: [{
          "id": 3,
          "title": "회원가입",
          "order": 0,
          "using": true,
          "category_groups": [
            {
              "using": "1",
              "id": 5,
              "title": "회원가입",
              "order": "0",
              "club_id": 3,
              "description": "회원가입"
            }
          ]
        }]
      }
    },
    LoginStore: res.resultData.LoginStore,
    UserStore: res.resultData.UserStore,
    BestPostStore: {},
    ReportStore: res.resultData.ReportStore,
    AuthStore: res.resultData.AuthStore
  });
});

router.get('/search', function (req, res, next) {
  const queryObj = {
    query: req.query.query,
    page: req.query.page || 0
  };
  const user = res.locals.user;

  M
    .Search
    .listByQuery(queryObj.query, queryObj.page, user)
    .then(function (posts) {

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
        SearchStore: {
          search: {
            posts: posts,
            collection: {
              current_page: 1,
              limit: 10,
              next_page: (posts.total > 10) ? 2 : null,
              total: posts.total
            }
          },
          query: queryObj.query
        },
        BestPostStore: {
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
        AuthStore: res.resultData.AuthStore
      })
    })
});

router.get('/setting', function (req, res, next) {
  assign(res.resultData, {
    SettingStore: {
      page: 'password'
    }
  });
  res.json(res.resultData);
});

router.get('/setting/password', function (req, res, next) {
  assign(res.resultData, {
    SettingStore: {
      page: 'password'
    }
  });
  res.json(res.resultData);
});

router.get('/setting/profile', function (req, res, next) {
  assign(res.resultData, {
    SettingStore: {
      page: 'profile'
    }
  });
  res.json(res.resultData);
});

router.get(['/policies', '/policies/privacy'], function (req, res, next) {
  res.json(res.resultData);
});

router.get('/policies/terms', function (req, res, next) {
  res.json(res.resultData);
});

router.get('/ad', function (req, res, next) {
  res.json(res.resultData);
});

router.get('/about', function (req, res, next) {
  res.json(res.resultData);
});

router.get('/careers', function (req, res, next) {
  res.json(res.resultData);
});

router.get('/help', function (req, res, next) {
  res.json(res.resultData);
});

module.exports = router;