'use strict';
const Db = require('trendclear-database').Models;
const nodemailer = require('nodemailer');
const redisClient = require('../../Util/RedisClient');
const bcrypt = require('bcrypt');
const shortId = require('shortid');
const jsonwebtoken = require('jsonwebtoken');
const jwtConf = require("../../config/jwt.js");
const Promise = require('bluebird');

class Comment {
  submitComment(comment, user) {
    return Db
      .tc_posts
      .query()
      .findById(comment.postId)
      .then(function (post) {
        return post
          .$relatedQuery('comments')
          .insert({
            content: comment.content,
            author_id: user.id,
            created_at: new Date()
          })
          .then(function (comment) {
            return post
              .$query()
              .increment('comment_count', 1)
              .then(function () {
                return comment
              })
          })
      })
      .then(function (comment) {
        return comment
          .$query()
          .eager('author')
      })
  }
}

module.exports = new Comment();