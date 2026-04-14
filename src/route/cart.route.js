const express = require('express');
const router = express.Router();

const { protectRoute } = require('../middleware/auth');
const asyncMiddleware = require('../middleware/async.middleware');

const {
  clearCart,
  createCart,
  removeItem,
  getCartForUser,
  increaseQty,
  decreaseQty,
} = require('../controllers/cartController');

router.get('/', protectRoute, asyncMiddleware(getCartForUser));
router.post('/', protectRoute, asyncMiddleware(createCart));

router.patch('/clear', protectRoute, asyncMiddleware(clearCart));
router.patch('/item/remove', protectRoute, asyncMiddleware(removeItem));
router.patch('/item/increase', protectRoute, asyncMiddleware(increaseQty));
router.patch('/item/decrease', protectRoute, asyncMiddleware(decreaseQty));

module.exports = router;
