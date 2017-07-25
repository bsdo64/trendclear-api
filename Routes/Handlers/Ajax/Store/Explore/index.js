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
      order: {column: 'follow_count', direction: 'DESC', },
      limit: 10,
      page: 1
    }),

    model.Collection.getExploreCollection({
      order: {column: 'follow_count', direction: 'DESC', },
      limit: 10,
      page: 1
    }),
  ]);

  posts.results = posts.results.map(post => {
    if (post.created_at) {
      post.created_at = moment(post.created_at).fromNow();
    }
    return post;
  });

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

router.get('/posts', async (req, res) => {

  const posts = await model.Post.bestPostList({
    user: res.locals.user,
    order: 'hot',
    listType: 'all'
  });

  posts.results = posts.results.map(post => {
    if (post.created_at) {
      post.created_at = moment(post.created_at).fromNow();
    }
    return post;
  });

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
    ]
  };

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