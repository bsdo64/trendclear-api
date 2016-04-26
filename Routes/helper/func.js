const cookieParser = require('cookie-parser');

exports.signedSessionId = function signedSessionId (rawSessionId) {
  return cookieParser.signedCookie(rawSessionId, '1234567890QWERTY');
};