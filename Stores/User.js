'use strict';
const User = require('../Models/User');

class UserStore {
  constructor() {
    this.data = {}
  }

  getUser() {
    return User
      .signin();
  }
}

module.exports = new UserStore();