// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const asyncMiddleware = require('../middleware/async.middleware');

const { checkAuth } = require('../controllers/authController');
const { protectRoute } = require('../middleware/auth');

router.get('/check', protectRoute, asyncMiddleware(checkAuth));

module.exports = router;
