const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const co = require('co');
const {model, moment} = require('util/func');

router.get('/', (req, res) => {
  const prop = {
    forumId: req.query.forumId,
    postId: req.query.postId,
    page: (req.query.p - 1) >= 0 ? (req.query.p - 1) : 0,
    commentPage: (req.query.comment_p - 1) >= 0 ? (req.query.comment_p - 1) : 0,
    ip: req.ip,
    forumSearch: req.query.forumSearch,
    forumPrefix: req.query.forumPrefix,
    order: req.query.order,
    comment_order: req.query.comment_order,
    user: res.locals.user
  };

  const user = res.locals.user;
  const visitor = res.locals.visitor;

  co(function* RouterHandler() {
    if (prop.forumId && prop.postId) {
      // 1. first, increment view count
      yield model.Post.incrementView(prop, visitor);

      // 2. retreive result
      const [ postList, post ] = yield [
        model.Forum.getForumPostList(prop),
        model.Post.findOneById(prop, user),
      ];

      post.created_at = moment(post.created_at).fromNow();

      postList.results = postList.results.map((post) => {
        if (post.created_at) {
          post.created_at = moment(post.created_at).fromNow();
        }
        return post;
      });

      post.comments = post.comments.map((comment) => {
        if (comment.created_at) {
          comment.created_at = moment(comment.created_at).fromNow();
        }

        if (comment.subComments) {
          comment.subComments = comment.subComments.map((subComment) => {
            if (subComment.created_at) {
              subComment.created_at = moment(subComment.created_at).fromNow();
            }
            return subComment;
          });
        }
        return comment;
      });

      const nextPage = parseInt(prop.page, 10) + 1;

      assign(res.resultData, {
        CommunityStore: {
          post: post,
          forum: res.resultData.CommunityStore.forum,
          list: {
            data: postList.results,
            collection: {
              current_page: nextPage,
              limit: 10,
              next_page: (postList.total > 10) ? nextPage + 1 : null,
              total: postList.total
            }
          }
        }
      });

      res.json(res.resultData);

    } else if (prop.forumId) {
      const posts = yield model.Forum.getForumPostList(prop);

      posts.results = posts.results.map((post) => {
        if (post.created_at) {
          post.created_at = moment(post.created_at).fromNow();
        }
        return post;
      });

      assign(res.resultData, {
        CommunityStore: {
          forum: res.resultData.CommunityStore.forum,
          list: {
            data: posts.results,
            collection: {
              current_page: parseInt(prop.page, 10) + 1,
              limit: 10,
              next_page: (posts.total > 10) ? 2 : null,
              total: posts.total
            }
          }
        }
      });

      res.json(res.resultData);

    } else {
      res.json({
        GnbStore: {
          openGnb: false,
          categoryMenu: {
            categories: res.resultData.GnbStore.categoryMenu.categories
          }
        },
        BestPostStore: {},
      });
    }
  });
});

router.get(['/settings', '/settings/foruminfo'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'foruminfo'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/forumurl'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'forumurl'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/forumprefix'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'forumprefix'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/announce'], (req, res) => {
  const prop = {
    forumId: req.query.forumId,
    postId: req.query.postId,
    page: (req.query.p - 1) >= 0 ? (req.query.p - 1) : 0,
    commentPage: (req.query.comment_p - 1) >= 0 ? (req.query.comment_p - 1) : 0,
    ip: req.ip,
    forumSearch: req.query.forumSearch,
    forumPrefix: req.query.forumPrefix,
  };

  model
    .Forum
    .getForumPostList(prop)
    .then(function (posts) {

      posts.results = posts.results.map((post) => {
        if (post.created_at) {
          post.created_at = moment(post.created_at).fromNow();
        }
        return post;
      });

      res.json({
        CommunityStore: {
          forum : res.resultData.CommunityStore.forum,
          list: {
            data: posts.results,
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
      });
    });
});

router.get(['/settings/writepost'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'writepost'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/writecomment'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'writecomment'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/share'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'share'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/promotion'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'promotion'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/managers'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'managers'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/banlist'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'banlist'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/spams'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'spams'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/spamreports'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'spamreports'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/forum'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_forum'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/views'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_views'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/visitors'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_visitors'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/likerank'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_likerank'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/commentrank'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_commentrank'
    }
  });
  res.json(res.resultData);
});

router.get(['/settings/stat/viewrank'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_viewrank'
    }
  });
  res.json(res.resultData);
});

router.get('/submit/forum', (req, res) => {

  res.json(res.resultData);

});

router.get('/submit', (req, res) => {
  const user = res.locals.user;
  const {postId, forumId, commentPage} = req.query;

  if (postId && user) {
    model
      .Post
      .findOneById({postId, commentPage}, user)
      .then(post => {

        if (post.author_id === user.id) {
          return model
            .Forum
            .getPrefix(post.forum_id)
            .then(function (prefixes) {
              return {
                prefixes: prefixes
              };
            })
            .then(function (result) {

              return model
                .Forum
                .getForumInfo(post.forum_id)
                .then(forum => {
                  result.forum = forum;

                  res.json({
                    GnbStore: res.resultData.GnbStore,
                    LoginStore: res.resultData.LoginStore,
                    UserStore: res.resultData.UserStore,
                    SubmitPostStore: {
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
                  });
                })
                .catch(err => {
                  res.json(err);
                })
            });
        } else {

          // Not author !
          res.redirect('/');
        }
      });
  } else if(forumId) {
    model
      .Forum
      .getPrefix(forumId)
      .then(function (prefixes) {
        const result = {
          prefixes: prefixes
        };

        return model
          .Forum
          .getForumInfo(forumId)
          .then(forum => {

            result.forum = forum;

            res.json({
              GnbStore: res.resultData.GnbStore,
              LoginStore: res.resultData.LoginStore,
              UserStore: res.resultData.UserStore,
              SubmitPostStore: {
                prefixes: result.prefixes,
                forum: result.forum,
                type: 'write'
              },
              ReportStore: res.resultData.ReportStore,
              AuthStore: res.resultData.AuthStore
            });
          });
      });
  } else {
    res.json({
      GnbStore: res.resultData.GnbStore,
      LoginStore: res.resultData.LoginStore,
      UserStore: res.resultData.UserStore,
      SubmitPostStore: {
        type: 'write'
      },
      ReportStore: res.resultData.ReportStore,
      AuthStore: res.resultData.AuthStore
    });
  }
});

router.use(['/:clubId', '/:clubId/feed'], (req, res, next) => {
  const forumId = req.params.clubId;

  co(function* () {
    try {
      if (forumId) {
        const forum = yield model
          .Forum
          .getForumInfo(forumId);

        forum.announces = forum.announces.map(announce => {
          if (announce.created_at) {
            announce.created_at = moment(announce.created_at).fromNow();
          }
          return announce;
        });

        assign(res.resultData, {
          CommunityStore: {
            forum: forum
          }
        });
      }

      next();
    } catch (e) {
      next(e);
    }
  });
});

router.get('/:clubId', (req, res) => {
  const prop = {
    forumId: req.params.clubId,
    postId: req.query.postId,
    page: (req.query.p - 1) >= 0 ? (req.query.p - 1) : 0,
    commentPage: (req.query.comment_p - 1) >= 0 ? (req.query.comment_p - 1) : 0,
    ip: req.ip,
    forumSearch: req.query.forumSearch,
    forumPrefix: req.query.forumPrefix,
    order: req.query.order,
    comment_order: req.query.comment_order,
    user: res.locals.user
  };

  const user = res.locals.user;
  const visitor = res.locals.visitor;

  co(function* RouterHandler() {

    if (prop.forumId && prop.postId) {
      // 1. increment view count, add latest seen
      yield [
        model.Post.incrementView(prop, visitor),
        model.Post.addLatestSeen(prop, user)
      ];

      // 2. get results
      const [postList, post] = yield [
        model.Forum.getForumPostList(prop),
        model.Post.findOneById(prop, user),
      ];

      post.created_at = moment(post.created_at).fromNow();

      postList.results = postList.results.map((post) => {
        if (post.created_at) {
          post.created_at = moment(post.created_at).fromNow();
        }
        return post;
      });

      post.comments = post.comments.map((comment) => {
        if (comment.created_at) {
          comment.created_at = moment(comment.created_at).fromNow();
        }

        if (comment.subComments) {
          comment.subComments = comment.subComments.map((subComment) => {
            if (subComment.created_at) {
              subComment.created_at = moment(subComment.created_at).fromNow();
            }
            return subComment;
          });
        }
        return comment;
      });

      const nextPage = parseInt(prop.page, 10) + 1;

      assign(res.resultData, {
        CommunityStore: {
          post: post,
          forum: res.resultData.CommunityStore && res.resultData.CommunityStore.forum,
          list: {
            data: postList.results,
            collection: {
              current_page: nextPage,
              limit: 10,
              next_page: (postList.total > 10) ? nextPage + 1 : null,
              total: postList.total
            }
          }
        }
      });

      res.json(res.resultData);

    } else if (prop.forumId) {
      const posts = yield model.Forum.getForumPostList(prop);

      posts.results = posts.results.map((post) => {
        if (post.created_at) {
          post.created_at = moment(post.created_at).fromNow();
        }
        return post;
      });

      assign(res.resultData, {
        CommunityStore: {
          forum: res.resultData.CommunityStore && res.resultData.CommunityStore.forum,
          list: {
            data: posts.results,
            collection: {
              current_page: parseInt(prop.page, 10) + 1,
              limit: 10,
              next_page: (posts.total > 10) ? 2 : null,
              total: posts.total
            }
          }
        }
      });

      res.json(res.resultData);

    } else {
      res.json({
        GnbStore: {
          openGnb: false,
          categoryMenu: {
            categories: res.resultData.GnbStore.categoryMenu.categories
          }
        },
        BestPostStore: {},
      });
    }
  });
});

router.get('/:clubId/feed', (req, res) => {
  const prop = {
    forumId: req.params.clubId,
    postId: req.query.postId,
    page: (req.query.p - 1) >= 0 ? (req.query.p - 1) : 0,
    commentPage: (req.query.comment_p - 1) >= 0 ? (req.query.comment_p - 1) : 0,
    ip: req.ip,
    forumSearch: req.query.forumSearch,
    forumPrefix: req.query.forumPrefix,
    order: req.query.order,
    comment_order: req.query.comment_order,
    user: res.locals.user
  };

  co(function* RouterHandler() {
    const posts = yield model.Forum.getForumPostList(prop);

    posts.results = posts.results.map((post) => {
      if (post.created_at) {
        post.created_at = moment(post.created_at).fromNow();
      }
      return post;
    });

    assign(res.resultData, {
      CommunityStore: {
        forum: res.resultData.CommunityStore && res.resultData.CommunityStore.forum,
        list: {
          data: posts.results,
          collection: {
            current_page: parseInt(prop.page, 10) + 1,
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