const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const {moment, model} = require('util/func');
const co = require('co');

router.use((req, res, next) => {

  co(function* RouterHandler() {

    const [categories, newForums, hotForums] = yield [
      model
        .Forum
        .Db
        .tc_categories
        .query()
        .where({type: 'venacle'})
        .eager('[forums]')
        .orderBy('order'),
      model
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
      model
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
    ];

    assign(res.resultData, {
      GnbStore: {
        openGnb: false,
        gnbMenu: { data: categories },
        categoryMenu: {},
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

    if (req.query.forumId) {
      const forum = yield model
        .Forum
        .getForumInfo(req.query.forumId);

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

  }).catch((err) => {

    next(err);
  });
});

router.get('/', (req, res) => {
  const props = {
    user: res.locals.user,
    page: req.query.page || 0
  };

  co(function* RouterHandler() {
    const posts = yield model
      .Post
      .bestPostList(props);

    posts.results = posts.results.map(post => {
      if (post.created_at) {
        post.created_at = moment(post.created_at).fromNow();
      }
      return post;
    });

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
    });

    res.json(res.resultData);
  });
});

router.get('/all', (req, res) => {
  const props = {
    user: res.locals.user,
    page: req.query.page || 0,
    listType: 'all'
  };

  co(function* RouterHandler() {
    const posts = yield model
      .Post
      .bestPostList(props);

    posts.results = posts.results.map(post => {
      if (post.created_at) {
        post.created_at = moment(post.created_at).fromNow();
      }
      return post;
    });

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
      },
    });

    res.json(res.resultData);
  });
});

router.use('/collection', require('./Collection/index.js'));
router.use('/club', require('./Community/index.js'));
router.use('/submit', require('./Submit/index.js'));
router.use('/activity', require('./User/Activity.js'));
router.use('/user', require('./User/index.js'));
router.use('/help', require('./Help/index.js'));
router.use('/search', require('./Search/index.js'));
router.get('/signin', (req, res) => {

  assign(res.resultData, {
    GnbStore: {
      openGnb: false,
      gnbMenu: res.resultData.GnbStore.gnbMenu,
      categoryMenu: {
        categories: [{
          id: 3,
          title: '회원가입',
          order: 0,
          using: true,
          category_groups: [
            {
              using: '1',
              id: 5,
              title: '회원가입',
              order: '0',
              club_id: 3,
              description: '회원가입'
            }
          ]
        }]
      }
    }
  });

  res.json(res.resultData);
});

router.get('/setting', (req, res) => {
  assign(res.resultData, {
    UserSettingStore: {
      page: 'password'
    }
  });
  res.json(res.resultData);
});

router.get('/setting/password', (req, res) => {
  assign(res.resultData, {
    UserSettingStore: {
      page: 'password'
    }
  });
  res.json(res.resultData);
});

router.get('/setting/profile', (req, res) => {
  assign(res.resultData, {
    UserSettingStore: {
      page: 'profile'
    }
  });
  res.json(res.resultData);
});

router.get(['/policies', '/policies/privacy'], (req, res) => {
  res.json(res.resultData);
});

router.get('/policies/terms', (req, res) => {
  res.json(res.resultData);
});

router.get('/about', (req, res) => {
  res.json(res.resultData);
});

router.get('/careers', (req, res) => {
  res.json(res.resultData);
});

router.get('/advertisement', (req, res) => {
  res.json(res.resultData);
});

router.get('/member/find', (req, res) => {
  res.json(res.resultData);
});

module.exports = router;