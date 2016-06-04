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

const Trendbox = require('../Trendbox');
const Skill = require('../Skill');

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
        return Promise
          .resolve()
          .then(Skill.setUsingTime(user, 'write_post'))
          .then(Trendbox.incrementPointT(user, 10))
          .then(Trendbox.incrementExp(user, 5))
          .then(() => post)
      })
      .then((post) => {
        return post
          .$query()
          .eager('forum.category.category_group.club')
      })

  }

  findOneById (postId, commentPage = 0, user) {
    const knex = Db.tc_comments.knex();
    const limit = 10;
    const offset = commentPage * limit;

    return Db
      .tc_posts
      .query()
      .eager('[likes, prefix, author.[icon.iconDef, profile, trendbox], forum.category.category_group.club, tags]')
      .where('id', '=' ,postId)
      .first()
      .then(post => {
        const query = post.$relatedQuery('comments');
        return Promise.all([
          query.resultSize(),
          query
            .offset(offset)
            .limit(limit)
            .eager('[subComments.author.[icon.iconDef, profile], author.[icon.iconDef, profile]]')
            .traverse(Db.tc_comments, function (comment, parentModel, relationName) {
              if (user) {
                Db
                  .tc_sub_comments
                  .query()
                  .select('tc_sub_comments.id as subCommentId', 'tc_likes.liker_id')
                  .join('tc_likes', 'tc_sub_comments.id', knex.raw(`CAST(tc_likes.type_id as int)`))
                  .andWhere('tc_likes.type', 'sub_comment')
                  .andWhere('tc_likes.liker_id', user.id)
                  .then(function (likeTable) {

                    _.map(comment.subComments, function (value) {
                      value.liked = !!_.find(likeTable, {subCommentId: value.id});
                    });
                  })
              }
            })
            .orderBy('created_at', 'desc')
        ])
        .spread((total, results) => {

          if (user) {
            return Db
              .tc_posts
              .query()
              .select('tc_posts.id as postId', 'tc_likes.liker_id')
              .join('tc_likes', 'tc_posts.id', knex.raw(`CAST(tc_likes.type_id as int)`))
              .andWhere('tc_likes.type', 'post')
              .andWhere('tc_likes.liker_id', user.id)
              .then(function (likeTable) {
                post.liked = !!_.find(likeTable, {postId: post.id});
                return true
              })
              .then(() =>
                Db
                  .tc_comments
                  .query()
                  .select('tc_comments.id as commentId', 'tc_likes.liker_id')
                  .join('tc_likes', 'tc_comments.id', knex.raw(`CAST(tc_likes.type_id as int)`))
                  .andWhere('tc_likes.type', 'comment')
                  .andWhere('tc_likes.liker_id', user.id)
                  .then(function (likeTable) {

                    _.map(results, function (value) {
                      value.liked = !!_.find(likeTable, {commentId: value.id});
                    });

                    post.comments = results;
                    post.comment_count = parseInt(total, 10);
                    return post;
                  })
              )
          } else {

            post.comments = results;
            post.comment_count = parseInt(total, 10);
            return post;

          }
        })

      })
  }

  bestPostList (page = 0, user) {
    const knex = Db.tc_posts.knex();

    return Db
      .tc_posts
      .query()
      .eager('[prefix, author.[icon.iconDef,profile,trendbox], forum.category.category_group.club, tags]')
      .orderBy('created_at', 'DESC')
      .page(page, 20)
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
          .where({ type: 'post', type_id: post.id, liker_id: user.id})
          .first()
          .then(like => {
            const query = post.$relatedQuery('likes');

            if (like && like.id) {
              // return query
              //   .update({
              //     type: 'post', liker_id: user.id
              //   })

              return false;
            } else {
              return query
                .insert({
                  type: 'post', liker_id: user.id
                })
            }
          })
          .then((like) => {
            const isModel = like instanceof Db.tc_likes;
            if (isModel) {
              return post
                .$query()
                .increment('like_count', 1)
                .then((increment) => {
                  return increment
                })
            } else {
              return post
            }
          })
      })
  }

  incrementView(prop, user) {
    let query = Db
      .tc_post_views
      .query()
      .where({user_id: user ? user.id : null, post_id: prop.postId, ip: prop.ip});


    return query
      .first()
      .then((view) => {
        if (view) {
          return Db
            .tc_post_views
            .query()
            .update({updated_at: new Date()})
            .where({user_id: user ? user.id : null, post_id: prop.postId, ip: prop.ip})
        } else {
          return Db
            .tc_posts
            .query()
            .where('id', '=', prop.postId)
            .increment('view_count', 1)
            .then(() => Db
              .tc_post_views
              .query()
              .insert({user_id: user ? user.id : null, post_id: prop.postId, ip: prop.ip, view_at: new Date(), updated_at: new Date()})
            )
        }
      })
  }
}

module.exports = new Post();