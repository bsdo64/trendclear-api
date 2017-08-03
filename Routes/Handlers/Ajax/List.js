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
  const page = parseInt(req.query.page);  // 2

  const clubs = await model.Forum.getList({
    order: {column: 'follow_count', direction: 'DESC', },
    limit: 10,
    page: page // 2
  });

  const nextPage = page + 1; // 3
  const limit = 10;

  res.json({
    type: 'List',
    lists : [
      {
        listName: 'exploreClubs',
        itemSchema: 'club',
        data: clubs,
        collection: {
          current_page: page, // 2
          limit: limit,
          next_page: (limit * page < clubs.total) ? (nextPage) : null,
          total: clubs.total
        }
      },
    ]
  });
});

module.exports = router;