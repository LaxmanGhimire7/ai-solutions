const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
      default: 'general',
    },
    order: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

gallerySchema.index({ published: 1, order: 1 });
gallerySchema.index({ category: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
