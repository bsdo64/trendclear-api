const express = require('express');
const router = express.Router();
const htmlToText = require('html-to-text');

const helper = require('../../Util/helper/func');
const M = require('../../../vn-api-model/index');

router.get('/meta/:postId', function (req, res) {
  const user = res.locals.user;

  // 메타 제공 시스템

  let defaultData = {
    production: !!process.env.NODE_ENV,

    title: '베나클',
    meta: [
      {name: 'description', content: '공유하세요! 원하는 모든 정보와 이슈가 있는곳, 베니클입니다.'},
      {name: 'og:title', content: '베나클'},
      {name: 'og:description', content: '공유하세요! 원하는 모든 정보와 이슈가 있는곳, 베니클입니다.'},
      {name: 'og:image', content: ''},
      {name: 'og:url', content: ''},
      {name: 'og:site_name', content: '베나클'},
    ]
  };

  if (req.params.postId) {
    M
      .Post
      .findOne({
        where: {id: req.params.postId},
        onlyOne: true,
        eager: null
      }, user)
      .then(post => {

        if (post) {
          post.content = htmlToText.fromString(post.content, {
            wordwrap: 150,
            ignoreImage: true
          });

          defaultData.title = `${post.title} - ${defaultData.title}`;
          defaultData.meta[0].content = post.content;
          defaultData.meta[1].content = post.title;
          defaultData.meta[2].content = post.content;
          if (post.has_img) {
            defaultData.meta[3].content = `http://${req.headers.host}/image/uploaded/files/${post.has_img}`;
          }
          if (post.link_id) {
            defaultData.meta[4].content = `http://${req.headers.host}/link/post/${post.link_id}`;
          }
        }

        res.json(defaultData);
      })
  } else {
    res.json(defaultData);
  }
});


module.exports = router;
