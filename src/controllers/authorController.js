const authorModel = require('../models/author');
const ErrorResponse = require('../helpers/ErrorResponse');

module.exports = {
  createAuthor: async (req, res) => {
    const body = req.body;

    const createAu = await authorModel.create(body);

    return res.status(201).json(createAu);
  },

  updateAuthor: async (req, res) => {
    const id = req.params.id;

    const { Language, DOB } = req.body;

    const update = await authorModel.findByIdAndUpdate(
      id,
      { Language, DOB },
      { new: true, runValidators: true },
    );

    if (!update) {
      throw new ErrorResponse(404, 'author not found');
    }

    return res.status(200).json(update);
  },

  deleteAuthor: async (req, res) => {
    const id = req.params.id;

    const deleAu = await authorModel.findByIdAndDelete(id);

    if (!deleAu) {
      throw new ErrorResponse(404, 'author not found');
    }

    return res.status(200).json({ message: 'author deleted' });
  },

  getAuthors: async (req, res) => {
    const getAus = await authorModel.find({});
    return res.status(200).json(getAus);
  },

  getAuthorById: async (req, res) => {
    const id = req.params.id;

    const findAuthor = await authorModel.findById(id);

    if (!findAuthor) {
      throw new ErrorResponse(404, 'cannot find author');
    }

    return res.status(200).json(findAuthor);
  },

  getAuthorByName: async (req, res) => {
    const { name } = req.query;

    if (!name) {
      throw new ErrorResponse(400, 'Missing query param: name');
    }

    const authors = await authorModel.find({
      name: { $regex: name, $options: 'i' },
    });

    return res.status(200).json(authors);
  },
};
