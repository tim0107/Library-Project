const categoryModel = require('../models/category');
const ErrorResponse = require('../helpers/ErrorResponse');

module.exports = {
  createCategory: async (req, res) => {
    const body = req.body;

    const createCate = await categoryModel.create(body);

    return res.status(201).json(createCate);
  },

  updateCate: async (req, res) => {
    const { id } = req.params;
    const { categoryName } = req.body;

    const update = await categoryModel.findByIdAndUpdate(
      id,
      { categoryName },
      { new: true, runValidators: true },
    );

    if (!update) {
      throw new ErrorResponse(404, 'category not found');
    }

    return res.status(200).json(update);
  },

  deleteCate: async (req, res) => {
    const { id } = req.params;

    const deletedCate = await categoryModel.findByIdAndDelete(id);

    if (!deletedCate) {
      throw new ErrorResponse(404, 'category not found');
    }

    return res.status(200).json({ message: 'category deleted' });
  },

  getAllCategory: async (req, res) => {
    const getAll = await categoryModel.find();
    return res.status(200).json(getAll);
  },
};
