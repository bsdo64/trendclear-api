const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const co = require('co');
const {model} = require('util/func');

router.get('/', (req, res) => {

  res.send(res.resultData);
});

router.get('/post', (req, res) => {

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
                });
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

module.exports = router;