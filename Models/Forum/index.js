'use strict';
const Db = require('trendclear-database').Models;
const nodemailer = require('nodemailer');
const redisClient = require('../../Util/RedisClient');
const bcrypt = require('bcrypt');
const shortId = require('shortid');
const jsonwebtoken = require('jsonwebtoken');
const jwtConf = require("../../config/jwt.js");
const Promise = require('bluebird');

class Forum {
  getForumInfo(forumId) {
    return Db
      .tc_forums
      .query()
      .eager('prefixes.posts')
      .where({id: forumId})
      .first()
      .then(function (forum) {
        return forum
      })
  }
}

module.exports = new Forum();