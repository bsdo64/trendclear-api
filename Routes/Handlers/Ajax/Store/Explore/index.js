const express = require('express');
const router = express.Router();
const {model, moment} = require('util/func');

router.get('/', async (req, res) => {
  const posts = await model.Post.bestPostList({
    user: res.locals.user,
    order: 'hot',
    listType: 'all'
  });

  const nextPage = 1;
  const limit = 10;
  res.resultData.listStores = {
    type: 'List',
    list : [
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