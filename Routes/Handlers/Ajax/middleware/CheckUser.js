const assign = require('deep-assign');
const co = require('co');
const {
  signedSessionId,
  model
} = require('util/func');

module.exports = function (req, res, next) {
  co(function* () {
    const cookies = req.cookies;
    const sessionId = signedSessionId(cookies.sessionId);
    const token = cookies.token;

    res.resultData = {};

    const user = yield model.User.checkUserAuth(sessionId, token);
    res.locals.visitor = yield model.User.checkUUID(req, sessionId, token, user);

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
          inventories: user.inventories,
          latestSeen: user.latestSeen,
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

    model
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
