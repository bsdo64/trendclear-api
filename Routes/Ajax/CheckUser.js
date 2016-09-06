const cookieParser = require('cookie-parser');
const assign = require('deep-assign');
const _ = require('lodash');
_.mixin(require('lodash-deep'));

const M = require('../../vn-api-model');

module.exports = function (req, res, next) {
  const cookies = req.cookies;
  const sessionId = cookieParser.signedCookie(cookies.sessionId, '1234567890QWERTY');
  const token = cookies.token;

  let resultData = res.resultData = {};
  
  M
    .User
    .checkUserAuth(sessionId, token)
    .then(user => {
      if (user) {
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
            skills: user.skills,
            notifications: {
              data: user.notifications
            },
            collections: user.collections,
            follow_forums: user.follow_forums,
            forumCreated: user.forumCreated
          },
          LoginStore: {
            isLogin: true,
            openLoginModal: false,
            loginSuccess: true,
            loginFail: false
          },
          AuthStore: {
            isLogin: true,
            userId: user.id
          }
        });

        next()

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

        next();
      }
    })
};
