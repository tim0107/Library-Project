const express = require('express');
const router = express.Router();

const { protectRoute } = require('../middleware/auth');
const asyncMiddleware = require('../middleware/async.middleware');

const {
  createBlog,
  getAllBlog,
  getBlogNewFeed,
  updateBlog,
  deleteBlog,
  getTrendingBlog,
  friendReactToBlog,
  commentOnBlog,
  editComment,
  deleteComment,
  getAllMineBlog,
  getCommentForOneBlog,
  getBlogsByUserId,
} = require('../controllers/blogController');

// BLOGS
router.post('/create', protectRoute, asyncMiddleware(createBlog));
router.get('/', protectRoute, asyncMiddleware(getAllBlog));
router.get('/newFeed', protectRoute, asyncMiddleware(getBlogNewFeed));
router.get('/getTrending', protectRoute, asyncMiddleware(getTrendingBlog));
router.get('/mineBlog', protectRoute, asyncMiddleware(getAllMineBlog));
router.get('/comment', protectRoute, asyncMiddleware(getCommentForOneBlog));

// COMMENTS
router.post('/:blogId/comments', protectRoute, asyncMiddleware(commentOnBlog));
router.patch(
  '/:blogId/comments/:commentId',
  protectRoute,
  asyncMiddleware(editComment),
);
router.delete(
  '/:blogId/comments/:commentId',
  protectRoute,
  asyncMiddleware(deleteComment),
);

// REACT
router.patch(
  '/:blogId/react',
  protectRoute,
  asyncMiddleware(friendReactToBlog),
);

// SINGLE BLOG ACTIONS
router.patch('/:blogId', protectRoute, asyncMiddleware(updateBlog));
router.delete('/:blogId', protectRoute, asyncMiddleware(deleteBlog));

// USER BLOGS
router.get('/user/:userId', asyncMiddleware(getBlogsByUserId));

module.exports = router;
