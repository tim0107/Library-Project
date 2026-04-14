const express = require('express');
const router = express.Router();

const { protectRoute } = require('../middleware/auth');
const asyncMiddleware = require('../middleware/async.middleware');

const {
  getUsersForSideBar,
  markMessageAsSeen,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');

// USERS / CONVERSATIONS
router.get('/users', protectRoute, asyncMiddleware(getUsersForSideBar));
router.get('/:id', protectRoute, asyncMiddleware(getMessages));

// MESSAGE ACTIONS
router.patch('/seen/:id', protectRoute, asyncMiddleware(markMessageAsSeen));
router.post('/:id', protectRoute, asyncMiddleware(sendMessage));

module.exports = router;
