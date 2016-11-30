const cookieParser = require('cookie-parser');
const moment = require('moment');
moment.locale('ko');

exports.signedSessionId = function signedSessionId (rawSessionId) {
  return cookieParser.signedCookie(rawSessionId, '1234567890QWERTY');
};

exports.moment = moment;