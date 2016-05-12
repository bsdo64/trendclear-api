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
      .eager('prefixes')
      .where({id: forumId})
      .first()
      .then(function (forum) {
        const knex = Db.tc_forum_prefixes.knex();
        return Db
          .tc_forum_prefixes
          .query()
          .select('tc_forum_prefixes.*', knex.raw('CAST(COUNT(tc_posts.id) as integer)'))
          .join('tc_posts', 'tc_forum_prefixes.id', 'tc_posts.prefix_id')
          .where('tc_forum_prefixes.forum_id', '=', forumId)
          .groupBy('tc_forum_prefixes.id')
          .then(function (prefixes) {
            forum.prefixes = prefixes;

            return forum;

          })
      })
  }
  
  getForumPostList(forumId, page = 0) {
    return Db
      .tc_posts
      .query()
      .where('forum_id', '=', forumId)
      .eager('[prefix, author.[icon,profile], forum.category.category_group.club]')
      .orderBy('created_at', 'DESC')
      .page(page, 10)

  }
  
  getPrefix(forumId) {
    return Db
      .tc_forum_prefixes
      .query()
      .where('forum_id', '=', forumId)
  }
}

module.exports = new Forum();