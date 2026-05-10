const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    authorTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Author title cannot exceed 100 characters'],
      default: '',
    },
    authorCompany: {
      type: String,
      trim: true,
      maxlength: [100, 'Company cannot exceed 100 characters'],
      default: '',
    },
    authorAvatar: {
      type: String,
      trim: true,
      default: '',
    },
    quote: {
      type: String,
      required: [true, 'Quote is required'],
      trim: true,
      maxlength: [1000, 'Quote cannot exceed 1000 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    published: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

testimonialSchema.index({ published: 1, order: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
