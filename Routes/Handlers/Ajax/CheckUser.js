const {signedSessionId} = require('../../Util/helper/func');
const assign = require('deep-assign');
const co = require('co');

const M = require('../../../vn-api-model/index');

module.exports = function (req, res, next) {
  co(function* () {
    const cookies = req.cookies;
    const sessionId = signedSessionId(cookies.sessionId);
    const token = cookies.token;

    res.resultData = {};

    const user = yield M.User.checkUserAuth(sessionId, token);
    res.locals.visitor = yield M.User.checkUUID(req, sessionId, token, user);

    if (user) {
      res.locals.user = user;

      assign(res.resultData, {
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
          forumCreated: user.forumCreated,
          forumManaged: user.forumManaged,
          inventories: user.inventories
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

      next();

    } else {
      assign(res.resultData, {
        UserStore: {
          user: null
        },
        LoginStore: {
          isLogin: false,
          openLoginModal: false,
          loginSuccess: false,
          loginFail: false
        },
        AuthStore: {
          isLogin: false,
          userId: null
        }
      });

      next();
    }
  }).catch(err => {

    M
      .User
      .checkUUID(req)
      .then(visitor => {

        res.locals.visitor = visitor;

        assign(res.resultData, {
          UserStore: {
            user: null
          },
          LoginStore: {
            isLogin: false,
            openLoginModal: false,
            loginSuccess: false,
            loginFail: false
          },
          AuthStore: {
            isLogin: false,
            userId: null
          }
        });

        next();
      });
  });
};
