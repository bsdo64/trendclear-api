'use strict';
const Db = require('trendclear-database').Models;
const nodemailer = require('nodemailer');
const redisClient = require('../../Util/RedisClient');
const bcrypt = require('bcrypt');
const shortId = require('shortid');
const jsonwebtoken = require('jsonwebtoken');
const jwtConf = require("../../config/jwt.js");
const Promise = require('bluebird');

class Club {
  getGnbMenus() {
    return Db
      .tc_clubs
      .query()
      .eager('[category_groups.categories.forums]')
      .then(function (clubs) {
        return clubs
      })
  }

  getClubMenusById(categoryId) {
    return Db
      .tc_club_categories
      .query()
      .eager('[forums]')
      .where({id: categoryId})
      .first()
      .then(function (categories) {
        return categories
      })
  }
}

module.exports = new Club();