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
  submitPost(post, user, query) {
    return Db
      .tc_posts
      .query()
      .insert({
        title: post.title,
        content: post.content,
        author_id: user.id,
        created_at: new Date(),
        forum_id: query.forumId,
        prefix_id: post.prefixId
      })
      .then(function (post) {
        return post
          .$query()
          .eager('forum.category.category_group.club')
      })
  }

  findOneById(postId) {
    return Db
      .tc_posts
      .query()
      .eager('[prefix, author.[icon.iconDef, profile], forum.category.category_group.club, tags, comments.[subComments.author, author]]')
      .where('id', '=' ,postId)
      .first()
  }

  bestPostList(page = 0) {
    return Db
      .tc_posts
      .query()
      .eager('[prefix, author.[icon.iconDef,profile], forum.category.category_group.club, tags]')
      .orderBy('created_at', 'DESC')
      .page(page, 10)
  }
}

module.exports = new Post();