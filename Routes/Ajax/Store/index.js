const express = require('express');
const Promise = require('bluebird');
const router = express.Router();
const helper = require('../../helper/func');
const assign = require('deep-assign');
const M = require('../../../vn-api-model');
const moment = require('moment');
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
    })
    .then(function () {

      assign(res.resultData, {
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

router.get('/collection/:collectionId', function (req, res, next) {
  const collectionId = req.params.collectionId;
  const user = res.locals.user;

  M
    .Collection
    .getCollectionPosts(collectionId, 0, user)
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

router.get('/collection', function (req, res, next) {
  res.redirect('/');
});

router.get('/community', function (req, res, next) {
  const prop = {
    forumId: req.query.forumId,
    postId: req.query.postId,
    page: (req.query.p - 1) >= 0 ? (req.query.p - 1) : 0,
    commentPage: (req.query.comment_p - 1) >= 0 ? (req.query.comment_p - 1) : 0,
    ip: req.ip,
    forumSearch: req.query.forumSearch,
    forumPrefix: req.query.forumPrefix,
  };

  const user = res.locals.user;

  if (prop.forumId && prop.postId) {

    Promise.join(
      M.Post.incrementView(prop, user),
      M.Forum.getForumPostList(prop.forumId, prop.page, prop.forumSearch, prop.forumPrefix),
      M.Post.findOneById(prop.postId, prop.commentPage, user),
      function (first, postList, post) {
        
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

        const nextPage = parseInt(prop.page, 10) + 1;
        
        res.json({
          CommunityStore: {
            type: 'post',
            post: post,
            forum: res.resultData.CommunityStore.forum,
            "list": {
              "page": nextPage,
              "data": postList.results,
              "total": postList.total,
              "limit": 10,
              collection: {
                current_page: nextPage,
                limit: 10,
                next_page: (postList.total > 10) ? nextPage + 1 : null,
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
      .catch(function (err) {
        console.log(5);

        console.error(err);
        console.error(err.stack);

      });

  } else if (prop.forumId) {
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

router.get(['/community/settings', '/community/settings/foruminfo'], function (req, res, next) {
  res.json(res.resultData);
});

router.get(['/community/settings*'], function (req, res, next) {
  res.json(res.resultData);
});

router.get(['/community/settings/stat*'], function (req, res, next) {
  res.json(res.resultData);
});

router.get('/community/submit/forum', function (req, res, next) {

  res.json(res.resultData);

});

router.get('/community/submit', function (req, res, next) {
  const user = res.locals.user;
  const {postId, forumId} = req.query;

  if (postId && user) {
    M
      .Post
      .findOneById(postId, 0, user)
      .then(post => {

        if (post.author_id === user.id) {
          return M
            .Forum
            .getPrefix(post.forum_id)
            .then(function (prefixes) {
              return {
                prefixes: prefixes
              };
            })
            .then(function (result) {

              return M
                .Forum
                .getForumInfo(post.forum_id)
                .then(forum => {
                  result.forum = forum;

                  res.json({
                    GnbStore: res.resultData.GnbStore,
                    LoginStore: res.resultData.LoginStore,
                    UserStore: res.resultData.UserStore,
                    SubmitStore: {
                      prefixes: result.prefixes,
                      forum: result.forum,
                      postId: post.id,
                      title: post.title,
                      content: post.content,
                      prefixId: post.prefix_id,
                      type: 'mod',
                      server: 'update'
                    },
                    ReportStore: res.resultData.ReportStore,
                    AuthStore: res.resultData.AuthStore
                  })
                })
            })
        } else {

          // Not author !
          res.redirect('/')
        }
      });
  } else if(forumId) {
    M
      .Forum
      .getPrefix(forumId)
      .then(function (prefixes) {
        const result = {
          prefixes: prefixes
        };

        return M
          .Forum
          .getForumInfo(forumId)
          .then(forum => {
            console.log(forum);
            result.forum = forum;

            res.json({
              GnbStore: res.resultData.GnbStore,
              LoginStore: res.resultData.LoginStore,
              UserStore: res.resultData.UserStore,
              SubmitStore: {
                prefixes: result.prefixes,
                forum: result.forum,
                type: 'write'
              },
              ReportStore: res.resultData.ReportStore,
              AuthStore: res.resultData.AuthStore
            })
          });
      })
  } else {
    res.json({
      GnbStore: res.resultData.GnbStore,
      LoginStore: res.resultData.LoginStore,
      UserStore: res.resultData.UserStore,
      SubmitStore: {
        type: 'write'
      },
      ReportStore: res.resultData.ReportStore,
      AuthStore: res.resultData.AuthStore
    })
  }
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
  
  return M
    .Post
    .likePostList(0, user)
    .then(posts => {
      "use strict";

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      assign(res.resultData, {
        ActivityStore: {
          type: 'likePostList',
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
      });
      
      res.json(res.resultData);
    });
});

router.get('/activity/posts', function (req, res, next) {
  const user = res.locals.user;

  return M
    .Post
    .myWritePostList(0, user)
    .then(posts => {
      "use strict";

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      assign(res.resultData, {
        ActivityStore: {
          type: 'myWritePostList',
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
      });

      res.json(res.resultData);
    });
});

router.get('/activity/comments', function (req, res, next) {
  const user = res.locals.user;

  return M
    .Post
    .myWriteCommentPostList(0, user)
    .then(posts => {
      "use strict";

      for (let i in posts.results) {
        for (let j in posts.results[i]) {
          if (j === 'created_at') {
            posts.results[i][j] = moment(posts.results[i][j]).format('YYYY-MM-DD HH:mm');
          }
        }
      }

      assign(res.resultData, {
        ActivityStore: {
          type: 'myWriteCommentPostList',
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
      });

      res.json(res.resultData);
    });
});

module.exports = router;