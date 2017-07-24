const express = require('express');
const router = express.Router();
const {model, moment} = require('util/func');

router.get('/', async (req, res) => {
  const [posts, clubs, collections] = await Promise.all([
    model.Post.bestPostList({
      user: res.locals.user,
      order: 'hot',
      listType: 'all'
    }),

    model.Forum.getList({
      user: res.locals.user,
      order: {column: 'follow_count', direction: 'DESC', },
      limit: 10,
      page: 1
    }),

    model.Collection.getExploreCollection({
      user: res.locals.user,
      order: {column: 'follow_count', direction: 'DESC', },
      limit: 10,
      page: 1
    }),
  ]);

  const nextPage = 1;
  const limit = 10;
  res.resultData.listStores = {
    type: 'List',
    lists : [
      {
        listName: 'exploreMainPosts',
        itemSchema: 'post',
        data: posts,
        collection: {
          current_page: nextPage,
          limit: limit,
          next_page: (limit * nextPage < posts.total) ? (nextPage + 1) : null,
          total: posts.total
        }
      },

      {
        listName: 'exploreMainClubs',
        itemSchema: 'club',
        data: clubs,
        collection: {
          current_page: nextPage,
          limit: limit,
          next_page: (limit * nextPage < clubs.total) ? (nextPage + 1) : null,
          total: clubs.total
        }
      },

      {
        listName: 'exploreMainCollections',
        itemSchema: 'collection',
        data: collections,
        collection: {
          current_page: nextPage,
          limit: limit,
          next_page: (limit * nextPage < collections.total) ? (nextPage + 1) : null,
          total: collections.total
        }
      },
    ]
  };

  res.json(res.resultData);
});

router.get('/posts', (req, res) => {
  res.json(res.resultData);
});

router.get('/clubs', (req, res) => {
  res.json(res.resultData);
});

router.get('/collections', (req, res) => {
  res.json(res.resultData);
});

router.get('/tags', (req, res) => {
  res.json(res.resultData);
});

module.exports = router;