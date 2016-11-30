const router = require('express').Router();
const { moment } = require('../../Util/helper/func');
const co = require('co');
const M = require('../../../vn-api-model/index');
const NotiSocketCli = require('vn-api-client').Socket.Noti;

const errorHandler = (req, res) => (err) => {
  console.error(err);
  console.error(err.stack);

  if (err.message === 'User not Found') {
    res.json({
      message: 'user not found',
      error: err,
    });
  } else {
    res.json({
      message: 'can\'t make token',
      error: err,
    });
  }
};

router.post('/post/view', (req, res) => {
  const viewObj = {
    postId: req.body.postId,
  };
  const user = res.locals.user;

  co(function* routerHandler() {
    res.json(yield M.Post.incrementView(viewObj, user));
  }).catch(errorHandler(req, res));
});

router.post('/subComment', (req, res) => {
  const commentObj = {
    content: req.body.content,
    commentId: req.body.commentId,
  };
  const user = res.locals.user;

  co(function* routerHandler() {
    const subComment = yield M.Comment.submitSubComment(commentObj, user);
    subComment.created_at = moment(subComment.created_at).fromNow();
    subComment.commentId = commentObj.commentId;
    res.json(subComment);
  }).catch(errorHandler(req, res));
});

router.put('/subComment', (req, res) => {
  const commentObj = {
    id: req.body.id,
    content: req.body.content,
  };
  const user = res.locals.user;

  co(function* routerHandler() {
    const comment = yield M.Comment.updateSubComment(commentObj, user);

    if (comment.created_at) {
      comment.created_at = moment(comment.created_at).fromNow();
    }
    res.json(comment);
  }).catch(errorHandler(req, res));
});

router.post('/comment', (req, res) => {
  const commentObj = {
    content: req.body.content,
    postId: req.body.postId,
  };
  const user = res.locals.user;

  co(function* routerHandler() {
    const newComment = yield M.Comment.submitComment(commentObj, user);
    const post = yield M.Post.findOneById(commentObj.postId, 0, user);
    const postAuthor = post.author;

    post.created_at = moment(post.created_at).fromNow();

    post.comments = post.comments.map((comment) => {
      if (comment.id === newComment.id) {
        comment.author = newComment.author;
      }

      if (comment.created_at) {
        comment.created_at = moment(comment.created_at).fromNow();
      }

      if (comment.subComments) {
        comment.subComments = comment.subComments.map((subComment) => {
          if (subComment.created_at) {
            subComment.created_at = moment(subComment.created_at).fromNow();
          }
          return subComment;
        });
      }
      return comment;
    });

    // Noti section
    if (post && postAuthor && (postAuthor.id !== user.id)) {
      const noti = yield postAuthor
        .$relatedQuery('notifications')
        .where('type', 'comment_write')
        .andWhere('target_id', post.id)
        .first();

      if (noti) {
        yield postAuthor
          .$relatedQuery('notifications')
          .patch({
            read: false,
            count: post.comment_count,
            receive_at: new Date(),
          })
          .where('id', noti.id);
      } else {
        yield postAuthor
          .$relatedQuery('notifications')
          .insert({
            type: 'comment_write',
            read: false,
            target_id: newComment.post_id,
            count: post.comment_count,
            receive_at: new Date(),
          });
      }

      const notis = yield postAuthor
        .$relatedQuery('notifications')
        .select('*', 'tc_user_notifications.id as id', 'tc_posts.id as post_id')
        .join('tc_posts', 'tc_posts.id', 'tc_user_notifications.target_id')
        .offset(0)
        .limit(10)
        .orderBy('receive_at', 'DESC');

      NotiSocketCli.emit('send noti', { notis, to: postAuthor.nick, userId: postAuthor.id });
    }

    res.json(post);
  }).catch(errorHandler(req, res));
});

router.put('/comment', (req, res) => {
  const commentObj = {
    id: req.body.id,
    content: req.body.content,
    postId: req.body.postId,
  };
  const user = res.locals.user;

  co(function* routerHandler() {
    const comment = yield M.Comment.updateComment(commentObj, user);
    if (comment.created_at) {
      comment.created_at = moment(comment.created_at).fromNow();
    }
    res.json(comment);
  }).catch(errorHandler(req, res));
});

router.post('/submit', (req, res) => {
  const postObj = {
    title: req.body.title,
    content: req.body.content,
    prefixId: req.body.prefixId,
    isAnnounce: req.body.isAnnounce,
    width: req.body.width,
    height: req.body.height,
    postImages: req.body.postImages,
    representingImage: req.body.representingImage,
  };
  const user = res.locals.user;

  co(function* routerHandler() {
    res.json(yield M.Post.submitPost(postObj, user, req.body.query));
  }).catch(errorHandler(req, res));
});

router.put('/submit', (req, res) => {
  const postObj = {
    postId: req.body.postId,
    title: req.body.title,
    content: req.body.content,
    isAnnounce: req.body.isAnnounce,
    width: req.body.width,
    height: req.body.height,
    postImages: req.body.postImages,
    representingImage: req.body.representingImage,
  };
  const user = res.locals.user;

  co(function* routerHandler() {
    res.json(yield M.Post.updatePost(postObj, user));
  }).catch(errorHandler(req, res));
});

module.exports = router;
