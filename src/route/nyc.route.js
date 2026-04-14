const express = require('express');
const router = express.Router();

const asyncMiddleware = require('../middleware/async.middleware');

const {
  lastViewed7Days,
  artistLastViewed7Days,
} = require('../controllers/nycAPIController');

router.get('/bookLastView', asyncMiddleware(lastViewed7Days));
router.get('/artistLastView', asyncMiddleware(artistLastViewed7Days));

module.exports = router;
