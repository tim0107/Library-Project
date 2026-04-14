const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    blogContent: {
      type: String,
      required: true,
    },

    blogImg: {
      url: { type: String, default: '' },
    },

    comment: [
      {
        commentDetail: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      },
    ],
    whoReact: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
          required: true,
        },
        reacted: {
          type: String,
          enum: ['Liked', 'Angry', 'Loved', 'None'],
          default: 'None',
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model('blog', blogSchema);
