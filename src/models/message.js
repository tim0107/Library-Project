const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// must have either text or image
messageSchema.pre('validate', function () {
  const hasText = typeof this.text === 'string' && this.text.trim().length > 0;

  const hasImage =
    typeof this.image === 'string' && this.image.trim().length > 0;

  if (!hasText && !hasImage) {
    throw new Error('Message must contain text or image');
  }
});

module.exports = mongoose.model('Message', messageSchema);
