const mongoose = require('mongoose');

const imageAssetSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 160,
    },
    originalName: {
      type: String,
      trim: true,
      maxlength: 255,
      default: '',
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    data: {
      type: Buffer,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

imageAssetSchema.index({ filename: 1 });

module.exports = mongoose.model('ImageAsset', imageAssetSchema);
