const express = require('express');
const router = express.Router();

const { protectRoute } = require('../middleware/auth');
const asyncMiddleware = require('../middleware/async.middleware');

const { removeFav, insertFav } = require('../controllers/favouriteController');

router.patch('/add', protectRoute, asyncMiddleware(insertFav));
router.patch('/remove', protectRoute, asyncMiddleware(removeFav));

module.exports = router;
