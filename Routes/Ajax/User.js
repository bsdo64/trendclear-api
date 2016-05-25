const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../helper/func');

const M = require('../../Models/index');

router.post('/avatarImg', function (req, res, next) {
  const imgObj = {
    file: req.body.file
  };
  const user = res.locals.user;
  
  M
    .User
    .updateAvatarImg(imgObj, user)
    .then(function (result) {
      res.json('ok');
    })
    .catch(function (err) {
      console.error(err);
      res.json({
        message: 'can\'t make token',
        error: err
      });
    });
});

router.post('/levelup', (req, res, next) => {
  const levelObj = {
    currentLevel: req.body.currentLevel
  };
  const user = res.locals.user;
  
  M
    .User
    .levelUp(levelObj, user)
    .then(newTrendbox => {
      res.json(newTrendbox);
    })
});

module.exports = router;
