const express = require('express');
const router = express.Router();
const assign = require('deep-assign');
const {moment, model} = require('util/func');
const co = require('co');

router.use((req, res, next) => {

  co(function* RouterHandler() {

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

    /**
     * famous rank list
     */
    const fList = yield model
        .Post
        .getFamousList();

    const nextPage = 1;
    const limit = 10;

    assign(res.resultData, {
      listStores: {
        type: 'List'
      }
    });

    fList.results = fList.results.map(post => {
      if (post.created_at) {
        post.created_at = moment(post.created_at).fromNow();
      }
      return post;
    });

    res.resultData.listStores.lists = res.resultData.listStores.lists || [];
    res.resultData.listStores.lists = res.resultData.listStores.lists.concat([
      {
        listName: 'famousPosts',
        itemSchema: 'post',
        data: fList,
        collection: {
          current_page: nextPage,
          limit: limit,
          next_page: (limit * nextPage < fList.total) ? (nextPage + 1) : null,
          total: fList.total
        }
      },
    ]);

    /**
     * default following club list
     */
    const nextPage2 = 1;
    const limit2 = 100;

    try {
      const followingClubIds = yield model.Db
          .tc_forum_categories
          .query()
          .select('tc_forum_categories.forum_id')
          .join('tc_categories', 'tc_forum_categories.category_id',
              'tc_categories.id');

      const defaultFollowingClubIdList = followingClubIds.map(v => v.forum_id);
      const dFCList = yield model
          .Forum
          .getList({
            order: {
              column: 'title',
              direction: 'DESC'
            },
            page: nextPage2,
            limit: limit2,
            whereIn: {
              type: 'id',
              data: defaultFollowingClubIdList
            }
          });

      assign(res.resultData, {
        listStores: {
          type: 'List'
        }
      });

      res.resultData.listStores.lists = res.resultData.listStores.lists || [];
      res.resultData.listStores.lists = res.resultData.listStores.lists.concat([
        {
          listName: 'defaultFollowingClubs',
          itemSchema: 'club',
          data: dFCList,
          collection: {
            current_page: nextPage2,
            limit: limit2,
            next_page: (limit2 * nextPage2 < dFCList.total)
                ? (nextPage2 + 1)
                : null,
            total: dFCList.total
          }
        },
      ]);
    }catch (e) {
      console.error(e);

      next(e);
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
router.use('/signin', require('./Signin/index.js'));
router.use('/explore', require('./Explore/index.js'));

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

router.get(['/policies', '/policies/privacy', '/policies/terms'], (req, res) => {
  res.json(res.resultData);
});

router.get('/about', (req, res) => {
  res.json(res.resultData);
});

router.get('/member/find', (req, res) => {
  res.json(res.resultData);
});

router.get('/careers', (req, res) => {
  res.json(res.resultData);
});

router.get('/advertisement', (req, res) => {
  res.json(res.resultData);
});

module.exports = router;