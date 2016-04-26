'use strict';
const Models = require('../Models');

class UserStore {
  constructor() {
    this.data = {}
  }

  getUser() {
    return Models.User
      .signin();
  }
}

module.exports = new UserStore();
