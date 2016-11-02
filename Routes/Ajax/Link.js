const express = require('express');
const router = express.Router();
const htmlToText = require('html-to-text');
const helper = require('../helper/func');
const M = require('../../vn-api-model');
const {Point} = require('vn-api-client').Socket;

router.get('/post/m/:linkId', function (req, res) {
  "use strict";
  const user = res.locals.user;

  // 메타 제공 시스템

  let defaultMetaData = {
    production: process.env.NODE_ENV ? true : false,

    title: '베나클',
    meta: [
      {name: 'description', content: '공유하세요! 원하는 모든 정보와 이슈가 있는곳, 베니클입니다.'},
      {name: 'og:title', content: '베나클'},
      {name: 'og:description', content: '공유하세요! 원하는 모든 정보와 이슈가 있는곳, 베니클입니다.'},
      {name: 'og:image', content: ''},
      {name: 'og:url', content: ''},
      {name: 'og:site_name', content: '베나클'},
    ],

    // hbs options
    layout: 'metaLayout'
  };

  if (req.params.linkId) {
    M
      .Post
      .findOne({
        where: {link_id: req.params.linkId},
        onlyOne: true
      }, user)
      .then(post => {
        "use strict";


        if (post) {
          post.content = htmlToText.fromString(post.content, {
            wordwrap: 150,
            ignoreImage: true
          });

          defaultMetaData.title = `${post.title} - ${defaultMetaData.title}`;
          defaultMetaData.meta[0].content = post.content;
          defaultMetaData.meta[1].content = post.title;
          defaultMetaData.meta[2].content = post.content;
          if (post.has_img) {
            defaultMetaData.meta[3].content = `http://${req.headers.host}/image/uploaded/files/${post.has_img}`;
          }
          if (post.link_id) {
            defaultMetaData.meta[4].content = `http://${req.headers.host}/link/post/${post.link_id}`;
          }
        }

        res.json(defaultMetaData);
      })
  } else {
    res.json(defaultMetaData);
  }
});

router.get('/post/:linkId', function (req, res, next) {
  "use strict";

  const visitor = res.locals.visitor;
  const user = res.locals.user;
  // 실질적인 방문자 추적 시스템

  M
    .Post
    .findOne({
      where: {link_id: req.params.linkId},
      onlyOne: true,
      eager: 'author'
    }, user)
    .then(post => {
      "use strict";

      if (post) {

        const log = {
          link_id: post.link_id,
          before_url: req.headers.referer,
          target_url: `/community?forumId=${post.forum_id}&postId=${post.id}`,
          type: 'post',
          type_id: post.id,
          visitor_uid: visitor.device.visitor_uid,
          clicked_at: new Date(),
          user_id: user ? user.id : null
        };

        M
          .Post
          .Db
          .tc_link_click_logs
          .query()
          .where({
            link_id: post.link_id,
            visitor_uid: visitor.device.visitor_uid,
            type: 'post',
            type_id: post.id,
          })
          .first()
          .then(existLog => {
            M
              .Post
              .Db
              .tc_link_click_logs
              .query()
              .insert(log)
              .then(linkLog => {

                if (existLog) {

                  // send post data
                  res.json(post);

                } else {

                  // increment T point
                  M
                    .Trendbox
                    .incrementPointT(post.author, 5)()
                    .then(() => {
                      // Point real-time send
                      Point.emit('send point', {
                        to: post.author.nick,
                        data: {
                          TP: 5
                        }
                      });

                      res.json(post);
                    })

                }
              });
          })
      } else {
        res.json(null);
      }
    })
});

module.exports = router;
