const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
      default: '',
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company cannot exceed 100 characters'],
      default: '',
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
      default: '',
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    jobDetails: {
      type: String,
      required: [true, 'Job details are required'],
      trim: true,
      maxlength: [2000, 'Job details cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ email: 1, createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ country: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
