const mongoose = require('mongoose');

const designSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    designName: {
      type: String,
      default: 'My Wall Design',
      trim: true
    },

    originalImage: {
      type: String,
      required: true
    },

    paintedImage: {
      type: String,
      required: true
    },

    selectedColor: {
      type: String,
      required: true
    },

    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Design', designSchema);
