const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const {model, moment} = require('util/func');

router.get(['/', '/foruminfo'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'foruminfo'
    }
  });
  res.json(res.resultData);
});

router.get(['/forumurl'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'forumurl'
    }
  });
  res.json(res.resultData);
});

router.get(['/forumprefix'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'forumprefix'
    }
  });
  res.json(res.resultData);
});

router.get(['/announce'], (req, res) => {
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

router.get(['/writepost'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'writepost'
    }
  });
  res.json(res.resultData);
});

router.get(['/writecomment'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'writecomment'
    }
  });
  res.json(res.resultData);
});

router.get(['/share'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'share'
    }
  });
  res.json(res.resultData);
});

router.get(['/promotion'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'promotion'
    }
  });
  res.json(res.resultData);
});

router.get(['/managers'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'managers'
    }
  });
  res.json(res.resultData);
});

router.get(['/banlist'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'banlist'
    }
  });
  res.json(res.resultData);
});

router.get(['/spams'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'spams'
    }
  });
  res.json(res.resultData);
});

router.get(['/spamreports'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'spamreports'
    }
  });
  res.json(res.resultData);
});

router.get(['/stat'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat'
    }
  });
  res.json(res.resultData);
});

router.get(['/stat/forum'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_forum'
    }
  });
  res.json(res.resultData);
});

router.get(['/stat/views'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_views'
    }
  });
  res.json(res.resultData);
});

router.get(['/stat/visitors'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_visitors'
    }
  });
  res.json(res.resultData);
});

router.get(['/stat/likerank'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_likerank'
    }
  });
  res.json(res.resultData);
});

router.get(['/stat/commentrank'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_commentrank'
    }
  });
  res.json(res.resultData);
});

router.get(['/stat/viewrank'], (req, res) => {
  assign(res.resultData, {
    ForumSettingStore: {
      content: 'stat_viewrank'
    }
  });
  res.json(res.resultData);
});

module.exports = router;