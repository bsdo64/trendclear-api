const express = require('express');
const router = express.Router();
const helper = require('../../helper/func');
const assign = require('deep-assign');
const M = require('vn-api-model');
const moment = require('moment');
const _ = require('lodash');
_.mixin(require('lodash-deep'));


router.use(function (req, res, next) {

  M
    .Club
    .getGnbMenus()
    .then(function(clubs) {

      assign(res.resultData, {
        GnbStore: {
          openGnb: false,
          gnbMenu: { openSideNow: null, data: clubs },
          categoryMenu: {}
        }
      });
    })
    .then(function () {

      assign(res.resultData, {
        ReportStore: {
          openReportModal: false
        },
        ListStore: {}
      });

    })
    .then(function() {
      if (req.query.postId && req.query.forumId && req.query.categoryId) {
        return M
          .Club
          .getClubMenusByCategoryId(req.query.categoryId)
          .then(function(category) {

            assign(res.resultData, {
              GnbStore: {
                categoryMenu: { categories: [category] }
              }
            });

            return M
              .Forum
              .getForumInfo(req.query.forumId)
          })
          .then(function (forum) {

            assign(res.resultData, {
              CommunityStore: {
                forum: forum
              }
            })

            next();
          })
      } else if (req.query.forumId && req.query.categoryId) {
        return M
          .Club
          .getClubMenusByCategoryId(req.query.categoryId)
          .then(function(category) {

            assign(res.resultData, {
              GnbStore: {
                categoryMenu: { categories: [category] }
              }
            });

            return M
              .Forum
              .getForumInfo(req.query.forumId)
          })
          .then(function (forum) {

            assign(res.resultData, {
              CommunityStore: {
                forum: forum
              }
            });

            return M
              .Forum
              .getForumPostList(req.query.forumId, req.query.page)
          })
          .then(function (result) {
            
            next();
          })
      } else if (req.query.categoryId) {
        return M
          .Club
          .getClubMenusByCategoryId(req.query.categoryId)
          .then(function(category) {

            assign(res.resultData, {
              GnbStore: {
                categoryMenu: { categories: [category] }
              }
            });

            next();
          })
      } else {
        next();
      }
    })
});

router.get('/', function (req, res, next) {
  const user = res.locals.user;

  M
    .Post
    .bestPostList(0, user)
    .then(function (posts) {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
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

router.get('/community', function (req, res, next) {
  const prop = {
    categoryId: req.query.categoryId,
    forumId: req.query.forumId,
    postId: req.query.postId,
    page: (req.query.p - 1) >= 0 ? (req.query.p - 1) : 0,
    commentPage: (req.query.comment_p - 1) >= 0 ? (req.query.comment_p - 1) : 0,
    ip: req.ip,
    forumSearch: req.query.forumSearch,
    forumPrefix: req.query.forumPrefix,
  };

  const user = res.locals.user;

  if (prop.categoryId && prop.forumId && prop.postId) {
    let postList;

    M
      .Post
      .incrementView(prop, user)
      .then(() => M
        .Forum
        .getForumPostList(prop.forumId, prop.page, prop.forumSearch, prop.forumPrefix)
      )
      .then(function (posts) {
        postList = posts;

        return M
          .Post
          .findOneById(prop.postId, prop.commentPage, user)
      })
      .then(function (post) {

        post.created_at = moment(post.created_at).format('YYYY-MM-DD HH:mm');

        for (let i in postList.results) {
          for (let j in postList.results[i]) {
            if (j === 'created_at') {
              postList.results[i][j] = moment(postList.results[i][j]).format('YYYY-MM-DD HH:mm');
            }
          }
        }

        for (let i in post.comments) {
          for (let j in post.comments[i]) {
            if (j === 'created_at') {
              post.comments[i][j] = moment(post.comments[i][j]).format('YYYY-MM-DD HH:mm');
            }

            if (j === 'subComments') {
              for (let k in post.comments[i][j]) {
                for (let l in post.comments[i][j][k]) {
                  if (l === 'created_at') {
                    post.comments[i][j][k][l] = moment(post.comments[i][j][k][l]).format('YYYY-MM-DD HH:mm');
                  }
                }
              }
            }
          }
        }

        res.json({
          CommunityStore: {
            type: 'post',
            post: post,
            forum: res.resultData.CommunityStore.forum,
            "list": {
              "page": parseInt(prop.page, 10) + 1,
              "data": postList.results,
              "total": postList.total,
              "limit": 10,
              collection: {
                current_page: 1,
                limit: 10,
                next_page: (postList.total > 10) ? 2 : null,
                total: postList.total
              }
            }
          },
          GnbStore: res.resultData.GnbStore,
          LoginStore: res.resultData.LoginStore,
          UserStore: res.resultData.UserStore,
          ReportStore: res.resultData.ReportStore,
          AuthStore: res.resultData.AuthStore
        })
      })

  } else if (prop.categoryId && prop.forumId) {
    M
      .Forum
      .getForumPostList(prop.forumId, prop.page, prop.forumSearch, prop.forumPrefix)
      .then(function (posts) {

        for (let i in posts.results) {
          for (let j in posts.results[i]) {
            if (j === 'created_at') {
              posts.results[i][j] = moment(posts.results[i][j]).format('MM-DD HH:mm');
            }
          }
        }

        res.json({
          CommunityStore: {
            type: 'forum',
            forum : res.resultData.CommunityStore.forum,
            list: {
              "data": posts.results,
              collection: {
                current_page: parseInt(prop.page, 10) + 1,
                limit: 10,
                next_page: (posts.total > 10) ? 2 : null,
                total: posts.total
              }
            }
          },
          GnbStore: res.resultData.GnbStore,
          LoginStore: res.resultData.LoginStore,
          UserStore: res.resultData.UserStore,
          ReportStore: res.resultData.ReportStore,
          AuthStore: res.resultData.AuthStore
        })
      });
  } else if (prop.categoryId) {
    res.json({
      CommunityStore: {
        type: 'category'
      },
      GnbStore: {
        openGnb: false,
        gnbMenu: res.resultData.GnbStore.gnbMenu,
        categoryMenu: {
          categories: res.resultData.GnbStore.categoryMenu.categories
        }
      },
      LoginStore: res.resultData.LoginStore,
      UserStore: res.resultData.UserStore,
      BestPostStore: {},
      ReportStore: res.resultData.ReportStore,
    })
  } else {
    res.json({
      GnbStore: {
        openGnb: false,
        gnbMenu: res.resultData.GnbStore.gnbMenu,
        categoryMenu: {
          categories: res.resultData.GnbStore.categoryMenu.categories
        }
      },
      LoginStore: res.resultData.LoginStore,
      UserStore: res.resultData.UserStore,
      BestPostStore: {},
      ReportStore: res.resultData.ReportStore,
    });
  }

});

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

router.get('/community/submit', function (req, res, next) {
  M
    .Forum
    .getPrefix(req.query.forumId)
    .then(function (prefixes) {
      res.json({
        GnbStore: {
          openGnb: false,
          gnbMenu: res.resultData.GnbStore.gnbMenu,
          categoryMenu: {
            categories: res.resultData.GnbStore.categoryMenu.categories
          }
        },
        LoginStore: res.resultData.LoginStore,
        UserStore: res.resultData.UserStore,
        SubmitStore: {
          prefixes: prefixes
        },
        ReportStore: res.resultData.ReportStore,
        AuthStore: res.resultData.AuthStore
      })
    })
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
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      res.json({
        GnbStore: {
          openGnb: false,
          gnbMenu: res.resultData.GnbStore.gnbMenu,
          categoryMenu: {
            categories: res.resultData.GnbStore.categoryMenu.categories
          }
        },
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
          }
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

router.use('/activity*', (req, res, next) => {
  const user = res.locals.user;

  M
    .User
    .getActivityMeta(user)
    .then((meta) => {
      assign(res.resultData, {
        ActivityStore: {
          meta: meta
        }
      });
      next();
    })
    .catch(err => {
      next(err)
    });
});

router.use('/activity*', (req, res, next) => {
  const user = res.locals.user;

  M
    .Post
    .bestPostList(0, user)
    .then(function (posts) {

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      assign(res.resultData, {
        BestPostStore: {
          posts: {
            data: [],
            collection: {}
          }
        }
      });

      next();
    });
});

router.get(['/activity', '/activity/likes'], function (req, res, next) {
  const user = res.locals.user;
  
  M
    .Post
    .likePostList(0, user)
    .then(posts => {
      "use strict";
      assign(res.resultData, {
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
        }
      })
      
      res.json(res.resultData);
    });
});

router.get('/activity/posts', function (req, res, next) {
  res.json(res.resultData);
});

router.get('/activity/comments', function (req, res, next) {
  res.json(res.resultData);
});

module.exports = router;