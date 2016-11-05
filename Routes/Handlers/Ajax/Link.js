const router = require('express').Router();
const htmlToText = require('html-to-text');
const co = require('co');
const M = require('../../../vn-api-model/index');
const { Point } = require('vn-api-client').Socket;

router.get('/post/m/:linkId', (req, res) => {
  const user = res.locals.user;

  // 메타 제공 시스템
  const defaultMetaData = {
    production: process.env.NODE_ENV || false,

    title: '베나클',
    meta: [
      { name: 'description', content: '공유하세요! 원하는 모든 정보와 이슈가 있는곳, 베니클입니다.' },
      { name: 'og:title', content: '베나클' },
      { name: 'og:description', content: '공유하세요! 원하는 모든 정보와 이슈가 있는곳, 베니클입니다.' },
      { name: 'og:image', content: '' },
      { name: 'og:url', content: '' },
      { name: 'og:site_name', content: '베나클' },
    ],

    // hbs options
    layout: 'metaLayout',
  };

  co(function* RouteHandler() {
    if (req.params.linkId) {
      const post = yield M
        .Post
        .findOne({
          where: { link_id: req.params.linkId },
          onlyOne: true,
        }, user);

      if (post) {
        post.content = htmlToText.fromString(post.content, {
          wordwrap: 150,
          ignoreImage: true,
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
    }
    res.json(defaultMetaData);
  });
});

router.get('/post/:linkId', (req, res) => {
  const visitor = res.locals.visitor;
  const user = res.locals.user;

  // 실질적인 방문자 추적 시스템

  co(function* RouteHandler() {
    const post = yield M
      .Post
      .findOne({
        where: { link_id: req.params.linkId },
        onlyOne: true,
        eager: 'author',
      }, user);

    if (post) {
      const log = {
        link_id: post.link_id,
        before_url: req.headers.referer,
        target_url: `/community?forumId=${post.forum_id}&postId=${post.id}`,
        type: 'post',
        type_id: post.id,
        visitor_uid: visitor.device.visitor_uid,
        clicked_at: new Date(),
        user_id: user ? user.id : null,
      };

      const [existLog] = yield [
        M.Post.Db.tc_link_click_logs
          .query()
          .where({
            link_id: post.link_id,
            visitor_uid: visitor.device.visitor_uid,
            type: 'post',
            type_id: post.id,
          })
          .first(),
        M.Post.Db.tc_link_click_logs.query().insert(log),
      ];

      if (!existLog) {
        yield M.Trendbox.incrementPointT(post.author, 5)();

        Point.emit('send point', {
          to: post.author.nick,
          data: { TP: 5 },
        });
      }
    }

    res.json(post);
  });
});

module.exports = router;
