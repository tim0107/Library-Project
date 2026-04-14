const mongoose = require('mongoose');

const authorSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  Language: {
    type: String,
  },
  DOB: {
    type: Date,
  },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
});

module.exports = mongoose.model('author', authorSchema);
