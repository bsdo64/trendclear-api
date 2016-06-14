const request = require('superagent');
const Promise = require('bluebird');

'use strict';

class ApiClient {
  constructor() {
    this.request = request;
    this.imageServer = 'http://localhost:3002' 
  }

  get(url, params) {
    const self = this;
    return new Promise((resolve, reject) => {
      let q = self.request.get(self.imageServer + url);

      if (params) {
        q.query(params);
      }

      q.end((err, res) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      })
    })
  }

  post(url, params) {
    const self = this;
    return new Promise((resolve, reject) => {
      let q = self.request.post(self.imageServer + url);

      if (params) {
        q.type('form').send(params);
      }

      q.end((err, res) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      })
    })
  }

  del(url, params) {
    const self = this;
    return new Promise((resolve, reject) => {
      let q = self.request.del(self.imageServer + url);

      if (params) {
        q.type('form').send(params);
      }

      q.end((err, res) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      })
    })
  }
}

module.exports = new ApiClient();