const cookieParser = require('cookie-parser');
const assign = require('deep-assign');

const M = require('../../vn-api-model');

module.exports = function (req, res, next) {
  const cookies = req.cookies;
  const sessionId = cookieParser.signedCookie(cookies.sessionId, '1234567890QWERTY');
  const token = cookies.token;

  res.resultData = {};
  
  M
    .User
    .checkUserAuth(sessionId, token)
    .then(user => {

      return M
        .User
        .checkUUID(req, sessionId, token, user)
        .then((visitor) => {
          res.locals.visitor = visitor;

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
              }
            });

            next();
          }
        });
    })
    .catch(err => {
      console.error(err);

      next();
    })
};
