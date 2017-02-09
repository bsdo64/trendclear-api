/**
 * Created by dobyeongsu on 2016. 11. 2..
 */
const {signedSessionId} = require('util/func');

module.exports = function RequestLog(req, res, next) {

  console.log();

  console.log('sessionId: ', signedSessionId(req.cookies.sessionId));
  console.log('query: ', req.query);
  console.log('body: ', req.body);

  next();
};