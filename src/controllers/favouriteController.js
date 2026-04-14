const userModel = require('../models/user');
const ErrorResponse = require('../helpers/ErrorResponse');

module.exports = {
  insertFav: async (req, res) => {
    const userId = req.user._id;
    const { bookData } = req.body;

    if (!bookData) {
      throw new ErrorResponse(400, 'bookData is missing');
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favourites: bookData } },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new ErrorResponse(404, 'user not found');
    }

    return res.status(200).json({
      message: 'Book added to favourites',
      favourites: updatedUser.favourites,
    });
  },

  removeFav: async (req, res) => {
    const userId = req.user._id;
    const { bookId } = req.body;

    if (!bookId) {
      throw new ErrorResponse(400, 'bookId is missing');
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $pull: { favourites: { id: bookId } } },
      { new: true },
    );

    if (!updatedUser) {
      throw new ErrorResponse(404, 'user not found');
    }

    return res.status(200).json({
      message: 'Removed from favourites',
      favourites: updatedUser.favourites,
    });
  },
};
