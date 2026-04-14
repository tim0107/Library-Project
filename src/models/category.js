const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    require: true,
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'book',
    },
  ],
});

module.exports = mongoose.model('category', categorySchema);
