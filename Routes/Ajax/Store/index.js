const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../../helper/func');
const assign = require('deep-assign');
const redisClient = require('../../../Util/RedisClient');
const jsonwebtoken = require("jsonwebtoken");
const jwtConf = require('../../../config/jwt');
const M = require('../../../Models/index');
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
              next_page: 2,
              total: posts.total
            }
          }
        },
        SigninStore: {
          emailDup: null,
          nickDup: null,
          emailRequested: null,
          submitResult: false,
          emailVerifySuccess: false,
          emailVerifyFail: false
        },
        CommunityStore: {}
      })
    });
});

router.get('/community', function (req, res, next) {
  const prop = {
    categoryId: req.query.categoryId,
    forumId: req.query.forumId,
    postId: req.query.postId,
    page: req.query.p - 1 || 0,
    commentPage: req.query.comment_p - 1 || 0
  };

  const user = res.locals.user;

  if (prop.categoryId && prop.forumId && prop.postId) {
    let postList;

    M
      .Forum
      .getForumPostList(prop.forumId, prop.page)
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
              "limit": 10
            }
          },
          GnbStore: res.resultData.GnbStore,
          LoginStore: res.resultData.LoginStore,
          UserStore: res.resultData.UserStore,
          SigninStore: {},
          BestPostStore: {}
        })
      })

  } else if (prop.categoryId && prop.forumId) {
    M
      .Forum
      .getForumPostList(prop.forumId, prop.page)
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
            "list": {
              "page": parseInt(prop.page, 10) + 1,
              "data": posts.results,
              "total": posts.total,
              "limit": 10
            }
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
          SigninStore: {
            emailDup: null,
            nickDup: null,
            emailRequested: null,
            submitResult: false,
            emailVerifySuccess: false,
            emailVerifyFail: false
          },
          BestPostStore: {}
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
      SigninStore: {
        emailDup: null,
        nickDup: null,
        emailRequested: null,
        submitResult: false,
        emailVerifySuccess: false,
        emailVerifyFail: false
      },
      BestPostStore: {}
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
      SigninStore: {
        emailDup: null,
        nickDup: null,
        emailRequested: null,
        submitResult: false,
        emailVerifySuccess: false,
        emailVerifyFail: false
      }
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
    SigninStore: {
      emailDup: null,
      nickDup: null,
      emailRequested: null,
      submitResult: false,
      emailVerifySuccess: false,
      emailVerifyFail: false
    }
  });
});

router.get('/community/submit', function (req, res, next) {
  M
    .Forum
    .getPrefix(req.query.forumId)
    .then(function (prefixes) {
      res.json({
        CommunityStore: {},
        GnbStore: {
          openGnb: false,
          gnbMenu: res.resultData.GnbStore.gnbMenu,
          categoryMenu: {
            categories: res.resultData.GnbStore.categoryMenu.categories
          }
        },
        LoginStore: res.resultData.LoginStore,
        UserStore: res.resultData.UserStore,
        SigninStore: {},
        BestPostStore: {
          posts: {
            data: []
          }
        },
        SubmitStore: {
          prefixes: prefixes
        }
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
      res.json({
        CommunityStore: {},
        GnbStore: {
          openGnb: false,
          gnbMenu: res.resultData.GnbStore.gnbMenu,
          categoryMenu: {
            categories: res.resultData.GnbStore.categoryMenu.categories
          }
        },
        LoginStore: res.resultData.LoginStore,
        UserStore: res.resultData.UserStore,
        SigninStore: {},
        SearchStore: {
          search: {
            posts: posts
          }
        },
        BestPostStore: {
          posts: {
            data: []
          }
        },
        SubmitStore: {}
      })
    })
});

module.exports = router;