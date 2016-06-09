const cookieParser = require('cookie-parser');
const Cookie = require('cookie');
const M = require('../../Models/index');

class NotiHandler {
  constructor(socket) {
    this.socket = socket;
    this.request = socket.request;
    this.headers = this.request.headers;
    this.cookie = Cookie.parse(this.headers.cookie);
  }
  joinRoom() {
    if (this.cookie.sessionId && this.cookie.token) {
      const sessionId = cookieParser.signedCookie(this.cookie.sessionId, '1234567890QWERTY');
      const token = this.cookie.token;
      const self = this;

      return function () {
        M
          .User
          .checkUserByToken(token, sessionId)
          .then((user) => {
            self.socket.join(user.nick);
          });
      }
    } else {
      return function () {}
    }
  }
}

module.exports = NotiHandler;