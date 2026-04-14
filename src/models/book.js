const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  author: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'author',
    require: true,
  },
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'category',
    require: true,
  },
  ISBN: {
    type: Number,
    require: true,
  },
  Desc: {
    type: String,
    require: true,
  },
  CoverImg: {
    type: String,
  },
  PublicYear: {
    type: Number,
  },
  price: {
    type: Number,
  },
});

module.exports = mongoose.model('book', bookSchema);
