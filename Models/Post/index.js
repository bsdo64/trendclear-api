'use strict';
const Db = require('trendclear-database').Models;
const nodemailer = require('nodemailer');
const redisClient = require('../../Util/RedisClient');
const bcrypt = require('bcrypt');
const shortId = require('shortid');
const jsonwebtoken = require('jsonwebtoken');
const jwtConf = require("../../config/jwt.js");
const Promise = require('bluebird');
const _ = require('lodash');

class Post {
  submitPost (post, user, query) {
    return Db
      .tc_posts
      .query()
      .insert({
        title     : post.title,
        content   : post.content,
        author_id : user.id,
        created_at: new Date(),
        forum_id  : query.forumId,
        prefix_id : post.prefixId
      })
      .then(function (post) {
        return post
          .$query()
          .eager('forum.category.category_group.club')
      })
  }

  findOneById (postId, commentPage = 0) {
    const limit = 10;
    const offset = commentPage * limit;
    return Db
      .tc_posts
      .query()
      .eager('[prefix, author.[icon.iconDef, profile], forum.category.category_group.club, tags, comments.[subComments.author.profile, author.profile]]')
      .filterEager('comments', builder =>
        builder
          .limit(limit)
          .offset(offset)
      )
      .where('id', '=' ,postId)
      .first()
      .then(post => {
        let query = post.$relatedQuery('comments');
        return Promise.all([
          query.resultSize(),
          query
            .offset(offset)
            .limit(limit)
            .eager('[subComments.author.[icon.iconDef, profile], author.[icon.iconDef, profile]]')
            .orderBy('created_at', 'desc')
        ])
        .spread((total, results) => {
          post.comments = results;
          post.comment_count = parseInt(total, 10);
          return post;
        })

      })
  }

  bestPostList (page = 0, user) {
    const knex = Db.tc_posts.knex();

    return Db
      .tc_posts
      .query()
      .eager('[prefix, author.[icon.iconDef,profile], forum.category.category_group.club, tags]')
      .orderBy('created_at', 'DESC')
      .page(page, 10)
      .then((posts) => {

        if (user) {
          return Db
            .tc_posts
            .query()
            .select('tc_posts.id as postId', 'tc_likes.liker_id')
            .join('tc_likes', 'tc_posts.id', knex.raw(`CAST(tc_likes.type_id as int)`))
            .andWhere('tc_likes.type', 'post')
            .andWhere('tc_likes.liker_id', user.id)
            .then(function (likeTable) {

              _.map(posts.results, function (value) {
                value.liked = !!_.find(likeTable, {'postId': value.id});
              });
              return posts
            })
        } else {
          return posts;
        }
      })
  }

  likePost (postObj, user) {
    return Db
      .tc_posts
      .query()
      .findById(postObj.postId)
      .then(post => {
        return Db
          .tc_likes
          .query()
          .where({ type: 'post', type_id: post.id, liker_id: user.id })
          .first()
          .then(like => {
            const query = post.$relatedQuery('likes');

            if (like && like.id) {
              return query
                .update({
                  type: 'post', liker_id: user.id
                })
            } else {
              return query
                .insert({
                  type: 'post', liker_id: user.id
                })
            }
          })
          .then((like) => {
            if (like !== 1) {
              return post
                .$query()
                .increment('like_count', 1)
                .then(() => {
                  return post
                })
            } else {
              return post
            }
          })
      })
  }
}

module.exports = new Post();