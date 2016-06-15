const cookieParser = require('cookie-parser');
const Cookie = require('cookie');
const M = require('../../Models/index');

module.exports = {
  joinHandler: function joinHandler(socket) {
    return () => {

      const headers = socket.request.headers;
      const cookie = Cookie.parse(headers.cookie);
      if (cookie.sessionId && cookie.token) {
        const sessionId = cookieParser.signedCookie(cookie.sessionId, '1234567890QWERTY');
        const token = cookie.token;

        M
          .User
          .checkUserByToken(token, sessionId)
          .then((user) => {
            console.log('Join the socket room : ', user.nick);
            socket.join(user.nick);
          });
      }
    }
  },

  emitNspRoomData: function (nsp, room, event, data) {
    nsp.to(room).emit(event, data);
  }
};
