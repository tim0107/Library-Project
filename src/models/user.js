const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
    trim: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  favourites: [
    {
      type: Object,
      ref: 'book',
    },
  ],
  avatarPicture: {
    type: String,
    default: '/share/Portrait_Placeholder.png',
  },

  phoneNumber: {
    type: Number,
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blog',
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  inComingFriendRequest: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  ],
  outGoingFriendRequest: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  ],
  cart: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'book',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
    },
  ],
});

module.exports = mongoose.model('user', userSchema);
