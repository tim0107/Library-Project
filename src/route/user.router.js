const express = require('express');
const router = express.Router();

const { protectRoute } = require('../middleware/auth');
const uploadAvatar = require('../middleware/uploadAvatar');
const asyncMiddleware = require('../middleware/async.middleware');

const {
  login,
  register,
  getAccounts,
  getOneAccount,
  updateAccount,
  deleteAccount,
  changePassword,
  changeProfilePic,
  findUserById,
} = require('../controllers/userController');

// AUTH
router.post('/register', asyncMiddleware(register));
router.post('/login', asyncMiddleware(login));

// PROFILE
router.patch(
  '/profile/avatar',
  protectRoute,
  uploadAvatar.single('avatar'),
  asyncMiddleware(changeProfilePic),
);

router.patch('/password', protectRoute, asyncMiddleware(changePassword));

// USERS
router.get('/', asyncMiddleware(getAccounts));
router.get('/username/:userName', asyncMiddleware(getOneAccount));
router.get('/:id', asyncMiddleware(findUserById));

router.patch('/:id', protectRoute, asyncMiddleware(updateAccount));
router.delete('/:id', protectRoute, asyncMiddleware(deleteAccount));

module.exports = router;
