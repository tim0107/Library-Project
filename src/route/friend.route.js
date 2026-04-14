const express = require('express');
const router = express.Router();

const { protectRoute } = require('../middleware/auth');
const asyncMiddleware = require('../middleware/async.middleware');

const {
  acceptFriendRequest,
  sendFriendRequest,
  deleteFriend,
  getAllFriend,
  getAllFriendOutGoing,
  getAllFriendRequest,
  rejectFriendRequest,
  getAllFriendNearBy,
  cancelMyFriendRequest,
  goToFriendProfile,
  unFriend,
} = require('../controllers/friendController');

// FRIEND ACTIONS
router.patch('/accept', protectRoute, asyncMiddleware(acceptFriendRequest));
router.patch('/request', protectRoute, asyncMiddleware(sendFriendRequest));
router.patch('/reject', protectRoute, asyncMiddleware(rejectFriendRequest));
router.patch(
  '/request/cancel',
  protectRoute,
  asyncMiddleware(cancelMyFriendRequest),
);
router.patch('/unfriend/:friendId', protectRoute, asyncMiddleware(unFriend));
router.patch('/delete', protectRoute, asyncMiddleware(deleteFriend));

// FRIEND LISTS
router.get('/', protectRoute, asyncMiddleware(getAllFriend));
router.get('/incoming', protectRoute, asyncMiddleware(getAllFriendRequest));
router.get('/outgoing', protectRoute, asyncMiddleware(getAllFriendOutGoing));
router.get('/suggestions', protectRoute, asyncMiddleware(getAllFriendNearBy));

// PROFILE
router.get(
  '/profile/:friendId',
  protectRoute,
  asyncMiddleware(goToFriendProfile),
);

module.exports = router;
