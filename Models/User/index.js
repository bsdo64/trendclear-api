'use strict';
const M = require('trendclear-database').Models;

class User {
  signin() {
    return M
      .tc_users
      .query()
      .then(function (user) {
        console.log(user);
      })
      .catch(function (err) {
        console.log(err);
      });
  }
}

module.exports = new User();