const express = require('express');
const router = express.Router();

const {
  createBook,
  updateBook,
  deleteBook,
  getAllBook,
  getBookByCategory,
  getOneBook,
  searchBooks,
} = require('../controllers/bookController');

const asyncMiddleware = require('../middleware/async.middleware');

router.post('/', asyncMiddleware(createBook));

router.patch('/:id', asyncMiddleware(updateBook));

router.get('/search', asyncMiddleware(searchBooks));

router.get('/category', asyncMiddleware(getBookByCategory));

router.get('/', asyncMiddleware(getAllBook));

router
  .route('/:id')
  .get(asyncMiddleware(getOneBook))
  .delete(asyncMiddleware(deleteBook));

module.exports = router;
