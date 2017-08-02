const express = require('express');
const router = express.Router();
const { moment, model } = require('util/func');

const ErrorHandler = (req, res) => {
  return (err) => {
    console.error(err);
    console.error(err.stack);

    if (err.message === 'User not Found') {
      res.json({
        message: 'user not found',
        error: err
      });
    } else {
      res.json({
        message: 'can\'t make token',
        error: err
      });
    }
  };
};

router.get('/', async (req, res) => {
  const listObj = {
    postId: req.query.listName,
  };
  const user = res.locals.user;

  const clubs = await model.Forum.getList({
    order: {column: 'follow_count', direction: 'DESC', },
    limit: 10,
    page: req.query.page
  });

  const nextPage = req.query.page;
  const limit = 10;

  res.json({
    type: 'List',
    lists : [
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
      },
    ]
  });
});

module.exports = router;