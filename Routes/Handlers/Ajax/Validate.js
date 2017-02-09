const express = require('express');
const router = express.Router();
const { model } = require('util/func');



router.get('/forum/create', (req, res) => {
  const validateObj = {
    title: req.query.title
  };

  model
    .Forum
    .validateCreate(validateObj)
    .then(forum => {
      if (forum.length) {
        res.json({
          success: false,
          code: 1,
          type: 'Error',
          name: 'Title exist',
          message: 'Title already exist'
        });
      } else {
        res.json({
          success: true
        });
      }
    })
});

module.exports = router;
