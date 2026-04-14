const express = require('express');
const router = express.Router();

const asyncMiddleware = require('../middleware/async.middleware');

const {
  createCategory,
  deleteCate,
  updateCate,
  getAllCategory,
} = require('../controllers/categoryController');

router
  .route('/')
  .get(asyncMiddleware(getAllCategory))
  .post(asyncMiddleware(createCategory));

router
  .route('/:id')
  .patch(asyncMiddleware(updateCate))
  .delete(asyncMiddleware(deleteCate));

module.exports = router;
