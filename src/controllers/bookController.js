const bookModel = require('../models/book');
const categoryModel = require('../models/category');
const authorModel = require('../models/author');
const ErrorResponse = require('../helpers/ErrorResponse');

module.exports = {
  createBook: async (req, res) => {
    const { title, author, category, ISBN, Desc, CoverImg, PublicYear, price } =
      req.body;

    const findAuthor = await authorModel.findOne({ name: author });
    const findCate = await categoryModel.findOne({ categoryName: category });

    if (!findAuthor) {
      throw new ErrorResponse(400, 'Author not exists');
    }

    if (!findCate) {
      throw new ErrorResponse(400, 'Category not exists');
    }

    const createdBook = await bookModel.create({
      title,
      author,
      category,
      ISBN,
      Desc,
      CoverImg,
      PublicYear,
      price,
    });

    return res.status(201).json(createdBook);
  },

  updateBook: async (req, res) => {
    const { id } = req.params;
    const { title, author, category, ISBN, Desc, CoverImg, PublicYear, price } =
      req.body;

    if (author) {
      const findAuthor = await authorModel.findOne({ name: author });
      if (!findAuthor) {
        throw new ErrorResponse(400, 'Author not exists');
      }
    }

    if (category) {
      const findCate = await categoryModel.findOne({ categoryName: category });
      if (!findCate) {
        throw new ErrorResponse(400, 'Category not exists');
      }
    }

    const update = await bookModel.findByIdAndUpdate(
      id,
      { title, author, category, ISBN, Desc, CoverImg, PublicYear, price },
      { new: true, runValidators: true },
    );

    if (!update) {
      throw new ErrorResponse(404, 'book not found');
    }

    return res.status(200).json(update);
  },

  deleteBook: async (req, res) => {
    const { id } = req.params;

    const deletedBook = await bookModel.findByIdAndDelete(id);

    if (!deletedBook) {
      throw new ErrorResponse(404, 'book not found');
    }

    return res.status(200).json({ message: 'book deleted' });
  },

  getAllBook: async (req, res) => {
    const books = await bookModel.find({});
    return res.status(200).json(books);
  },

  getOneBook: async (req, res) => {
    const { id } = req.params;

    const book = await bookModel.findById(id);

    if (!book) {
      throw new ErrorResponse(404, 'book not found');
    }

    return res.status(200).json(book);
  },

  getBookByCategory: async (req, res) => {
    const { categoryName } = req.query;

    if (!categoryName) {
      throw new ErrorResponse(400, 'categoryName is required');
    }

    const findCate = await categoryModel.findOne({ categoryName });

    if (!findCate) {
      throw new ErrorResponse(404, 'Category not found');
    }

    const books = await bookModel.find({ category: categoryName });

    return res.status(200).json(books);
  },

  searchBooks: async (req, res) => {
    const {
      q,
      limit = 20,
      startIndex = 0,
      orderBy = 'relevance',
      printType = 'books',
      filter,
    } = req.query;

    if (!q) {
      throw new ErrorResponse(400, 'Search query is required');
    }

    const maxResults = Math.min(Number(limit) || 20, 40);
    const start = Math.max(Number(startIndex) || 0, 0);

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    const params = new URLSearchParams({
      q,
      maxResults: String(maxResults),
      startIndex: String(start),
      orderBy,
      printType,
    });

    if (filter) params.set('filter', filter);
    if (apiKey) params.set('key', apiKey);

    const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new ErrorResponse(500, `Google Books error: ${errorText}`);
    }

    const data = await response.json();

    const results = (data.items || []).map((item) => {
      const v = item.volumeInfo || {};
      const s = item.saleInfo || {};

      const img =
        v.imageLinks?.extraLarge ||
        v.imageLinks?.large ||
        v.imageLinks?.medium ||
        v.imageLinks?.thumbnail ||
        v.imageLinks?.smallThumbnail ||
        null;

      return {
        key: item.id,
        id: item.id,
        title: v.title || 'No title',
        author: (v.authors && v.authors[0]) || 'Unknown',
        authors: v.authors || [],
        categories: v.categories || [],
        description: v.description || '',
        firstPublishYear: v.publishedDate ? v.publishedDate.slice(0, 4) : null,
        publishedDate: v.publishedDate || null,
        isbn:
          (v.industryIdentifiers || []).find((x) => x.type === 'ISBN_13')
            ?.identifier ||
          (v.industryIdentifiers || []).find((x) => x.type === 'ISBN_10')
            ?.identifier ||
          null,
        coverUrl: img,
        pageCount: v.pageCount || null,
        language: v.language || null,
        previewLink: v.previewLink || null,
        infoLink: v.infoLink || null,
        price:
          s?.retailPrice?.amount != null
            ? {
                amount: s.retailPrice.amount,
                currency: s.retailPrice.currencyCode,
              }
            : null,
        isEbook: s?.isEbook ?? null,
      };
    });

    return res.status(200).json({
      total: data.totalItems || 0,
      startIndex: start,
      limit: maxResults,
      results,
    });
  },
};
