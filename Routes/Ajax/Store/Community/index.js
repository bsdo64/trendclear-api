const express = require('express');
const Promise = require('bluebird');
const router = express.Router();
const assign = require('deep-assign');
const M = require('../../../../vn-api-model');
const moment = require('moment');
const _ = require('lodash');
_.mixin(require('lodash-deep'));

router.get('/', function (req, res, next) {
  const prop = {
    forumId: req.query.forumId,
    postId: req.query.postId,
    page: (req.query.p - 1) >= 0 ? (req.query.p - 1) : 0,
    commentPage: (req.query.comment_p - 1) >= 0 ? (req.query.comment_p - 1) : 0,
    ip: req.ip,
    forumSearch: req.query.forumSearch,
    forumPrefix: req.query.forumPrefix,
    order: req.query.order
  };

  const user = res.locals.user;

  if (prop.forumId && prop.postId) {

    Promise.join(
      M.Post.incrementView(prop, user),
      M.Forum.getForumPostList(prop),
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
      .getForumPostList(prop)
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

router.get(['/settings', '/settings/foruminfo'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'foruminfo'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/forumurl'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'forumurl'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/forumprefix'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'forumprefix'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/announce'], function (req, res, next) {
  const prop = {
    forumId: req.query.forumId,
    postId: req.query.postId,
    page: (req.query.p - 1) >= 0 ? (req.query.p - 1) : 0,
    commentPage: (req.query.comment_p - 1) >= 0 ? (req.query.comment_p - 1) : 0,
    ip: req.ip,
    forumSearch: req.query.forumSearch,
    forumPrefix: req.query.forumPrefix,
  };

  M
    .Forum
    .getForumPostList(prop)
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
        ForumSettingStore: {
          content: 'announce',
          announce: {

          }
        },
        GnbStore: res.resultData.GnbStore,
        LoginStore: res.resultData.LoginStore,
        UserStore: res.resultData.UserStore,
        ReportStore: res.resultData.ReportStore,
        AuthStore: res.resultData.AuthStore
      })
    });
});

router.get(['/settings/writepost'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'writepost'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/writecomment'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'writecomment'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/share'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'share'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/promotion'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'promotion'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/managers'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'managers'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/banlist'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'banlist'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/spams'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'spams'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/spamreports'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'spamreports'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/forum'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_forum'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/views'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_views'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/visitors'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_visitors'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/likerank'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_likerank'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/commentrank'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_commentrank'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/viewrank'], function (req, res, next) {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_viewrank'
    }
  });
  res.json(res.resultData);
});

router.get('/submit/forum', function (req, res, next) {

  res.json(res.resultData);

});

router.get('/submit', function (req, res, next) {
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


module.exports = router;