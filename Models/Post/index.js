'use strict';
const Db = require('trendclear-database').Models;
const nodemailer = require('nodemailer');
const redisClient = require('../../Util/RedisClient');
const bcrypt = require('bcrypt');
const shortId = require('shortid');
const jsonwebtoken = require('jsonwebtoken');
const jwtConf = require("../../config/jwt.js");
const Promise = require('bluebird');

class Post {
  submitPost(post, user) {
    
    return Db
      .tc_posts
      .query()
      .insert({
        title: post.title,
        content: post.content,
        author_id: user.id,
        created_at: new Date()
      })
      .then(function (post) {
        return post
      })
  }
}

module.exports = new Post();