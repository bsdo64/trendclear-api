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
          .eager('author.[profile, grade]')
      })
  }

  likeComment (commentObj, user) {
    return Db
      .tc_comments
      .query()
      .findById(commentObj.commentId)
      .then(comment => {
        return Db
          .tc_likes
          .query()
          .where({ type: 'comment', type_id: comment.id, liker_id: user.id })
          .first()
          .then(like => {
            const query = comment.$relatedQuery('likes');
            
            if (like && like.id) {
              return query
                .update({
                  type: 'comment', liker_id: user.id
                })
            } else {
              return query
                .insert({
                  type: 'comment', liker_id: user.id
                })
            }
          })
          .then((like) => {
            if (like !== 1) {
              return comment
                .$query()
                .increment('like_count', 1)
                .then(() => {
                  return comment
                })
            } else {
              return comment
            }
          })
      })
  }

}

module.exports = new Comment();