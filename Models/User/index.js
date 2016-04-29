'use strict';
const M = require('trendclear-database').Models;
const nodemailer = require('nodemailer');
const redisClient = require('../../Util/RedisClient');
const bcrypt = require('bcrypt');
const shortId = require('shortid');
const jsonwebtoken = require('jsonwebtoken');
const jwtConf = require("../../config/jwt.js");
const Promise = require('bluebird');

class User {
  /**
   *
   * Signin
   *
   * @param email
   * @returns {Promise.<T>}
   */
  checkEmailDup(email) {
    return M
      .tc_users
      .query()
      .where('email', email)
      .count('id as dup')
      .first()
      .then(function (dup) {
        return dup;
      })
      .catch(function (err) {
        console.log(err);
      });
  }
  checkNickDup(nick) {
    return M
      .tc_users
      .query()
      .where('nick', nick)
      .count('id as dup')
      .first()
      .then(function (dup) {
        return dup;
      })
      .catch(function (err) {
        console.log(err);
      });
  }
  requestEmailVerifyCode(email, sessionId) {
    var code = Math.floor(Math.random() * 900000) + 100000;
    return redisClient.get('sess:' + sessionId)
      .then(function (result) {
        var resultJS = JSON.parse(result);
        resultJS.verifyCode = code;
        return JSON.stringify(resultJS);
      })
      .then(function (result) {
        return redisClient.set('sess:' + sessionId, result);
      })
      .then(function () {
        var transporter = nodemailer.createTransport('smtps://bsdo64%40gmail.com:dkbs13579@smtp.gmail.com');

        var mailOptions = {
          from: '"고블린클럽" <bsdo64@gmail.com>', // sender address
          to: email, // list of receivers
          subject: '안녕하세요! 고블린 클럽입니다. 이메일 코드를 확인해주세요', // Subject line
          html: '<b>' + code + '</b>' // html body
        };

        return new Promise(function (resolve, reject) {
          transporter.sendMail(mailOptions, function (error, info) {
            console.log(error, info);
            if (error) {
              return reject(error);
            }

            return resolve({
              result: 'ok',
              message: info.response
            });
          });
        });
      });
  }
  checkVerifyCode(code, sessionId) {
    return redisClient
      .get('sess:' + sessionId)
      .then(function (result) {
        var resultJS = JSON.parse(result);
        if (parseInt(resultJS.verifyCode, 10) !== parseInt(code, 10)) {
          throw new Error('인증코드가 일치하지 않습니다');
        }

        return { result: 'ok' };
      });
  }
  signin(user, sessionId) {
    const userObj = {
      email: user.email,
      nick: user.nick,
      password: user.password,
      sex: user.sex,
      birth: user.birth
    };

    // password encrypt
    const passwordHash = bcrypt.hashSync(userObj.password, 10);

    const uCreate = {
      email: userObj.email,
      nick: userObj.nick,
      uid: shortId.generate(),
      password: {
        password: passwordHash
      },
      profile: {
        sex: userObj.sex,
        birth: user.birth,
        joined_at: new Date()
      },
      trendbox: {
        level: 1
      }
    };
    return M
      .tc_users
      .query()
      .insertWithRelated(uCreate)
      .then(function (newUser) {

        return Promise.join(
          M
            .tc_grades
            .query()
            .where('name', '없음')
            .pick(['id']),

          M
            .tc_roles
            .query()
            .where('name', '회원')
            .pick(['id']),

          function (grade, role) {
            return newUser
              .$relatedQuery('grade')
              .insert({
                grade_id: grade.id
              })
              .then(function () {
                return newUser
                  .$relatedQuery('role')
                  .insert({
                    role_id: role.id
                  })
              })
          })
          .then(function () {
            return User.setTokenWithRedisSession({nick: uCreate.nick, id: newUser.id}, sessionId);
          })
          .then(function (token) {
            console.log(token);
            return {token: token};
          });
      })
      .catch(function (err) {
        console.log(err);
        throw new Error(err);
      })
  }

  /**
   *
   *  CheckUserLogin
   *
   */
  checkUserLogin(user) {
    const userObj = {
      id: user.id,
      nick: user.nick
    };

    return M
      .tc_users
      .query()
      .eager('[trendbox, grade, role, profile]')
      .where(userObj)
      .then(function (findUser) {
        return findUser
      })
      .catch(function (err) {
        console.log(err);
        throw new Error(err);
      })
  }

  
  login(user, sessionId) {
    const userObj = {
      email: user.email,
      password: user.password
    };

    return M
      .tc_users
      .query()
      .eager('password')
      .where({ email: userObj.email })
      .first()
      .then(function (findUser) {
        if (!findUser) {
          throw new Error('User not Found');
        }

        console.dir(findUser, {depth: 10});
        console.log(findUser.password[0].password);
        var checkPassword = bcrypt.compareSync(userObj.password, findUser.password[0].password); // true
        if (checkPassword) {
          return User.setTokenWithRedisSession({nick: findUser.nick, id: findUser.id}, sessionId);
        } else {
          throw new Error('Password is not Correct');
        }
      });
  }
  
  logout(user, sessionId) {
    return redisClient.get('sess:' + sessionId)
      .then(function (result) {
        var resultJS = JSON.parse(result);
        delete resultJS.token;

        return JSON.stringify(resultJS);
      })
      .then(function (result) {
        return redisClient.set('sess:' + sessionId, result);
      });
  };

  static setTokenWithRedisSession(user, sessionId) {
    const token = jsonwebtoken.sign(user, jwtConf.secret, jwtConf.option);

    return redisClient.get('sess:' + sessionId)
      .then(function (result) {
        var resultJS = JSON.parse(result);
        resultJS.token = token;
        return JSON.stringify(resultJS);
      })
      .then(function (result) {
        return redisClient.set('sess:' + sessionId, result);
      })
      .then(function (result) {
        return token;
      });
  }
}

module.exports = new User();