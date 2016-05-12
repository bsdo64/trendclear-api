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
  const cookies = req.cookies;
  const sessionId = cookieParser.signedCookie(cookies.sessionId, '1234567890QWERTY');
  const token = cookies.token;

  redisClient.get('sess:' + sessionId, function (err, result) {
    var resultJS = JSON.parse(result);
    var resultData = res.resultData = {};

    if (err) {
      next(err);
    }
    if (!resultJS) {
      next(new Error('Malformed sessionId'));
    }

    if (resultJS.token && !token) {
      next(new Error('Client dont has Token but redis has'));
    }

    function tokenVerify(token, redisToken) {
      return token === redisToken;
    }

    if (resultJS.token && token) {
      var verifyToken = tokenVerify(token, resultJS.token);
      if (!verifyToken) {
        next(new Error('Malformed token'));
      }

      jsonwebtoken.verify(token, jwtConf.secret, function (jwtErr, decoded) {
        // err
        if (jwtErr || !decoded) {
          return next(jwtErr);
        }

        var userObj = {
          id: decoded.id,
          nick: decoded.nick
        };
        // decoded undefined
        M
          .User
          .checkUserLogin(userObj)
          .then(function (user) {
            if (!user) {
              return next(new Error('Malformed jwt payload'));
            }

            assign(resultData, {
              UserStore: {
                user: {
                  id: user.id,
                  nick: user.nick,
                  email: user.email
                },
                trendbox: user.trendbox,
                profile: user.profile,
                grade: user.grade,
                role: user.role,
                icon: user.icon[0],
              },
              LoginStore: {
                isLogin: true,
                openLoginModal: false,
                loginSuccess: true,
                loginFail: false
              }
            });
            next(); // User Login!!
          });
      });
    } else {
      assign(resultData, {
        UserStore: {
          user: null
        },
        LoginStore: {
          isLogin: false,
          openLoginModal: false,
          loginSuccess: false,
          loginFail: false
        }
      });
      next(); // User Not Login!!
    }
  });
});

router.use(function (req, res, next) {
  M
    .Club
    .getGnbMenus()
    .then(function(clubs) {

      assign(res.resultData, {
        GnbStore: {
          openGnb: false,
          gnbMenu: { openSideNow: null, data: clubs }
        }
      });
    })
    .then(function() {
      if (req.query.postId && req.query.forumId && req.query.categoryId) {
        return M
          .Club
          .getClubMenusByCategoryId(req.query.categoryId)
          .then(function(category) {
            console.log(1, category);

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
            console.log(2, category);

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
            console.log(result.results);

            next();
          })
      } else if (req.query.categoryId) {
        return M
          .Club
          .getClubMenusByCategoryId(req.query.categoryId)
          .then(function(category) {
            console.log(3, category);

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
  M
    .Post
    .bestPostList()
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
            categories: [{
              "id": 3,
              "title": "베스트",
              "order": 0,
              "description": "베스트",
              "using": true,
              "category_groups": [
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "id": 37,
                          "title": "헤어",
                          "order": "0",
                          "description": "헤어",
                          "using": "1",
                          "category_id": 11
                        },
                        {
                          "id": 38,
                          "title": "탈모",
                          "order": "1",
                          "description": "탈모",
                          "using": "1",
                          "category_id": 11
                        }
                      ],
                      "id": 11
                    }
                  ],
                  "id": 5,
                  "title": "전체보기",
                  "order": "0",
                  "club_id": 3,
                  "description": "전체보기"
                }
              ]
            }]
          }
        },
        LoginStore: res.resultData.LoginStore,
        UserStore: {
          user: res.resultData.UserStore.user,
          trendbox: res.resultData.UserStore.trendbox,
          profile: res.resultData.UserStore.profile,
          icon: res.resultData.UserStore.icon,
          grade: {
            name: '브론즈',
            img: 'grade_bronze.png'
          }
        },
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
    postId: req.query.postId
  };

  if (prop.categoryId && prop.forumId && prop.postId) {
    let postList;
    
    M
      .Forum
      .getForumPostList(prop.forumId)
      .then(function (posts) {
        postList = posts;

        return M
          .Post
          .findOneById(prop.postId)
      })
      .then(function (post) {
        res.json({
          CommunityStore: {
            type: 'post',
            post: post,
            forum: res.resultData.CommunityStore.forum,
            "list": {
              "page": 1,
              "data": postList.results,
              "total": postList.total,
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
          SigninStore: {},
          BestPostStore: {}
        })
      })

  } else if (prop.categoryId && prop.forumId) {
    M
      .Forum
      .getForumPostList(prop.forumId)
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
              "page": 1,
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
          BestPostStore: {
            posts: {
              data: []
            }
          }
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
      BestPostStore: {
        posts: {
          data: []
        }
      }
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
    BestPostStore: {
      posts: {
        data: []
      }
    },
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


module.exports = router;