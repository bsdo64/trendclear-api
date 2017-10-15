const express = require('express');
const router = express.Router();
const {model, moment} = require('util/func');
const assign = require('deep-assign');

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

  assign(res.resultData, {
    listStores: {
      type: 'List'
    }
  });

  res.resultData.listStores.lists = res.resultData.listStores.lists || [];
  res.resultData.listStores.lists = res.resultData.listStores.lists.concat([
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
    }
  ]);

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

  assign(res.resultData, {
    listStores: {
      type: 'List'
    }
  });

  res.resultData.listStores.lists = res.resultData.listStores.lists || [];
  res.resultData.listStores.lists = res.resultData.listStores.lists.concat([
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
  ]);

  res.json(res.resultData);
});

router.get('/clubs', async (req, res) => {
  const clubs = await model.Forum.getList({
    order: {column: 'follow_count', direction: 'DESC', },
    limit: 10,
    page: 1
  });

  clubs.results = clubs.results.map(post => {
    if (post.created_at) {
      post.created_at = moment(post.created_at).fromNow();
    }
    return post;
  });

  const nextPage = 1;
  const limit = 10;

  assign(res.resultData, {
    listStores: {
      type: 'List'
    }
  });

  res.resultData.listStores.lists = res.resultData.listStores.lists || [];
  res.resultData.listStores.lists = res.resultData.listStores.lists.concat([
    {
      listName: 'exploreClubs',
      itemSchema: 'club',
      data: clubs,
      collection: {
        current_page: nextPage,
        limit: limit,
        next_page: (limit * nextPage < clubs.total) ? (nextPage + 1) : null,
        total: clubs.total
      }
    }
  ]);

  res.json(res.resultData);
});

router.get('/collections', (req, res) => {
  res.json(res.resultData);
});

router.get('/tags', (req, res) => {
  res.json(res.resultData);
});

module.exports = router;