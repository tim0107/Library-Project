const express = require('express');

const router = express.Router();

const {
  searchCategoryBookFromGoogle,
} = require('../controllers/apiForCategory');

router.route('/').get(searchCategoryBookFromGoogle);

module.exports = router;
