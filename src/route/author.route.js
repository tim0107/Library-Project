const express = require('express');
const router = express.Router();

const {
  createAuthor,
  getAuthorById,
  getAuthorByName,
  getAuthors,
  updateAuthor,
  deleteAuthor,
} = require('../controllers/authorController');

const asyncMiddleware = require('../middleware/async.middleware');

router.get('/byname', getAuthorByName);

router
  .route('/')
  .get(asyncMiddleware(getAuthors))
  .post(asyncMiddleware(createAuthor));

router
  .route('/:id')
  .get(asyncMiddleware(getAuthorById))
  .patch(asyncMiddleware(updateAuthor))
  .delete(asyncMiddleware(deleteAuthor));

module.exports = router;
