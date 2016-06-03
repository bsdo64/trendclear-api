'use strict';
const M = require('trendclear-database').Models;
const nodemailer = require('nodemailer');
const redisClient = require('../../Util/RedisClient');
const bcrypt = require('bcrypt');
const shortId = require('shortid');
const jsonwebtoken = require('jsonwebtoken');
const jwtConf = require("../../config/jwt.js");
const Promise = require('bluebird');

const Trendbox = require('../Trendbox');

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

    function hashPassword(userPassword, salt = 10) {
      return new Promise((resolve, reject) => {
        bcrypt.hash(userPassword, salt, (err, res) => {
          if (err) {
            reject(err);
          }

          if (res) {
            resolve(res)
          }
        })
      })
    }

    let uCreate = {
      email: userObj.email,
      nick: userObj.nick,
      uid: shortId.generate(),
      password: {
        password: userObj.password
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
    return hashPassword(userObj.password, 10)
      .then((hashPassword) => {
        uCreate.password.password = hashPassword;

        return M
          .tc_users
          .query()
          .insertWithRelated(uCreate)
      })
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
            return User.setTokenWithRedisSession({nick: uCreate.nick, id: newUser.id}, sessionId)
          })
          .then(function (token) {
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
      .eager('[trendbox, grade.gradeDef, role, profile, icon.iconDef]')
      .where(userObj)
      .first()
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

    function passwordCompare(userPassword, hash) {
      return new Promise((resolve, reject) => {
        bcrypt.compare(userPassword, hash, (err, res) => {
          if (err) {
            reject(err);
          }

          if (res) {
            resolve(res)
          }
        })
      })
    }

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

        return passwordCompare(userObj.password, findUser.password.password)
          .then((passwordCheck) => {
            if (passwordCheck === false) {
              throw new Error('Password is not Correct');
            }
            return User
              .setTokenWithRedisSession({nick: findUser.nick, id: findUser.id}, sessionId)
          })
      })
      .catch(err => {
        throw new Error('Password is not Correct');
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

  checkUserByToken(token, sessionId) {
    return redisClient
      .get('sess:' + sessionId)
      .then(function (result) {
        var resultJS = JSON.parse(result);
        console.log(resultJS.token === token);

        let jwt = Promise.promisifyAll(jsonwebtoken);
        if (token) {
          return jwt.verify(token, jwtConf.secret);
        } else {
          return null
        }
      })
      .then(function (decoded) {
        if (!decoded) {
          return null
        }

        return M
          .tc_users
          .query()
          .where({id: decoded.id, nick: decoded.nick})
          .first()
      })
      .catch(function (err) {
        console.error(err);
        throw new Error(err);
      })
  };

  updateAvatarImg(imgObj, user) {
    return user
      .$relatedQuery('profile')
      .update({
        avatar_img: imgObj.file.name
      })
      .then(function (numberOfAffectedRows) {
        return numberOfAffectedRows;
      });
  }
  
  levelUp(levelObj, user) {
    return Promise
      .resolve()
      .then(Trendbox.incrementLevel(user, levelObj.currentLevel))
      .then(newTrendbox => newTrendbox)
  }

  static setTokenWithRedisSession(user, sessionId) {
    return new Promise((resolve, reject) => {
      jsonwebtoken.sign(user, jwtConf.secret, jwtConf.option, (err, token) => {
        return redisClient
          .get('sess:' + sessionId)
          .then(function (result) {
            var resultJS = JSON.parse(result);
            resultJS.token = token;
            return JSON.stringify(resultJS);
          })
          .then(function (result) {
            return redisClient.set('sess:' + sessionId, result);
          })
          .then(function (result) {
            resolve(token);
          })
          .catch(err => {
            reject(err);
          })
      });
    })
  }
}

module.exports = new User();