/**
 * Created by dobyeongsu on 2016. 5. 24..
 */
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

class Search {
  listByQuery (query, page = 0) {
    const limit = 20;

    const array = query.split(' ');
    console.log(array);

    let q = Db
      .tc_posts
      .query()
      .where('title', 'like', '%' + query + '%');

    for (let index in array) {
      q = q.orWhere('content', 'like', '%' + array[index] + '%')
    }

    return q
      .eager('[prefix, author.[icon.iconDef,profile], forum.category.category_group.club, tags]')
      .orderBy('created_at', 'DESC')
      .page(page, limit)
  }
}

module.exports = new Search();