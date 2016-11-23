const express = require('express');
const router = express.Router();
const helper = require('../../Util/helper/func');
const htmlToText = require('html-to-text');
const {Point, Venalink} = require('vn-api-client').Socket;
const M = require('../../../vn-api-model/index');
const co = require('co');

router.get('/', (req, res) => {
  const user = res.locals.user;

  M
    .VenacleStore
    .getItems()
    .then(items => {
      res.json({items: items});
    })
});

router.get('/post/m/:linkId', (req, res) => {
  const user = res.locals.user;

  // 메타 제공 시스템

  let defaultMetaData = {
    production: !!process.env.NODE_ENV,

    title: '베나클',
    meta: [
      {name: 'description', content: '공유하세요! 원하는 모든 정보와 이슈가 있는곳, 베니클입니다.'},
      {name: 'og:title', content: '베나클'},
      {name: 'og:description', content: '공유하세요! 원하는 모든 정보와 이슈가 있는곳, 베니클입니다.'},
      {name: 'og:image', content: ''},
      {name: 'og:url', content: `http://${req.headers.host}`},
      {name: 'og:site_name', content: 'Venacle'},
    ],

    // hbs options
    layout: 'metaLayout'
  };

  if (req.params.linkId) {

    co(function* () {
      const postOptions = {
        onlyOne: true,
        eager: 'author'
      };
      const post = yield M.Post.findOneByVenalinkUid(req.params.linkId, postOptions, user);

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
        if (req.params.linkId) {
          defaultMetaData.meta[4].content = `http://${req.headers.host}/venalink/post/${req.params.linkId}`;
        }
      }

      res.json(defaultMetaData);
    });

  } else {
    res.json(defaultMetaData);
  }
});

const errorHandler = (error) => {
  res.json(err);
};

router.get('/post/:linkId', (req, res) => {

  const visitor = res.locals.visitor;
  const user = res.locals.user;
  // 실질적인 방문자 추적 시스템

  co(function* () {
    const postOptions = {
      onlyOne: true,
      eager: 'author'
    };
    const post = yield M.Post.findOneByVenalinkUid(req.params.linkId, postOptions, user);

    if (post) {
      const existLog = yield M.Venalink.findVenalinkClickLogs(req.params.linkId, post, visitor);
      const clickLog = yield M.Venalink.createVenalinkClickLogs(req.params.linkId, req.headers.referer, post, visitor, user);

      if (existLog) {

        // send post data
        res.json(post);

      } else {

        // increment R point
        const participantUser = yield M.Venalink.payParticipantR(req.params.linkId, user);

        Point.emit('send point', {
          to: participantUser.nick,
          data: {
            RP: 5
          }
        });

        res.json(post);
      }
    } else {
      res.json(post);
    }
  }).catch(errorHandler)
});

router.post('/activate', (req, res) => {
  const user = res.locals.user;
  const venalinkObj = {
    total_amount_r: req.body.total_amount_r,
    terminate_at: req.body.terminate_at,
    post_id: req.body.post_id,
    activate_item_id: req.body.activate_item_id,
    active_at: req.body.active_at
  };

  co(function* () {
    const [venalink, trendbox, inventories] = yield M.Venalink.checkVenalinkItem(venalinkObj, user);

    if (venalink) {

      Venalink.emit('add venalink cron job', venalink);

      res.json({
        success: true,
        venalink: venalink,
        inventories: inventories,
        trendbox: trendbox
      });
    } else {
      res.json({
        success: false,
        venalink: null,
        inventories: inventories,
        trendbox: trendbox
      });
    }

  }).catch(err => {

    res.json(err);
  });
});

router.post('/participate', (req, res) => {
  const user = res.locals.user;
  const venalinkObj = {
    venalink_id: req.body.venalink_id,
    used_venalink_item_id: req.body.used_venalink_item_id,
    request_at: req.body.request_at
  };

  co(function* () {
    const [participateVenalink, inventories] = yield M.Venalink.checkVenalinkParticipate(venalinkObj, user);

    if (participateVenalink) {
      res.json({
        success: true,
        participateVenalink: participateVenalink,
        inventories: inventories
      });
    } else {
      res.json({
        success: false,
        participateVenalink: null,
        inventories: inventories
      });
    }

  }).catch(err => {
    res.json(err);
  });
});

module.exports = router;
