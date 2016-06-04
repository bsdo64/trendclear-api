const cookieParser = require('cookie-parser');
const assign = require('deep-assign');
const redisClient = require('../../Util/RedisClient');
const jsonwebtoken = require("jsonwebtoken");
const jwtConf = require('../../config/jwt');
const moment = require('moment');
const _ = require('lodash');
_.mixin(require('lodash-deep'));

const M = require('../../Models/index');

module.exports = function (req, res, next) {
  const cookies = req.cookies;
  const sessionId = cookieParser.signedCookie(cookies.sessionId, '1234567890QWERTY');
  const token = cookies.token;

  redisClient.get('sess:' + sessionId, function (err, result) {
    var resultJS = JSON.parse(result);
    var resultData = res.resultData = {};

    if (err) {
      next(err);
    }
    if (!resultJS) {
      next(new Error('Malformed sessionId'));
    }

    if (resultJS.token && !token) {
      next(new Error('Client dont has Token but redis has'));
    }

    function tokenVerify(token, redisToken) {
      return token === redisToken;
    }

    if (resultJS.token && token) {
      var verifyToken = tokenVerify(token, resultJS.token);
      if (!verifyToken) {
        next(new Error('Malformed token'));
      }

      jsonwebtoken.verify(token, jwtConf.secret, function (jwtErr, decoded) {
        // err
        if (jwtErr || !decoded) {
          return next(jwtErr);
        }

        var userObj = {
          id: decoded.id,
          nick: decoded.nick
        };
        // decoded undefined
        M
          .User
          .checkUserLogin(userObj)
          .then(function (user) {
            if (!user) {
              return next(new Error('Malformed jwt payload'));
            }

            res.locals.user = user;

            assign(resultData, {
              UserStore: {
                user: {
                  id: user.id,
                  nick: user.nick,
                  email: user.email
                },
                trendbox: user.trendbox,
                profile: user.profile,
                grade: user.grade,
                role: user.role,
                icon: user.icon[0],
                skills: user.skills
              },
              LoginStore: {
                isLogin: true,
                openLoginModal: false,
                loginSuccess: true,
                loginFail: false
              }
            });
            next(); // User Login!!
          });
      });
    } else {
      assign(resultData, {
        UserStore: {
          user: null
        },
        LoginStore: {
          isLogin: false,
          openLoginModal: false,
          loginSuccess: false,
          loginFail: false
        }
      });
      next(); // User Not Login!!
    }
  });
};
