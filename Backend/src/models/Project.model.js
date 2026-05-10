const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    clientName: {
      type: String,
      trim: true,
      maxlength: [150, 'Client name cannot exceed 150 characters'],
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    outcome: {
      type: String,
      trim: true,
      maxlength: [1000, 'Outcome cannot exceed 1000 characters'],
      default: '',
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

projectSchema.index({ published: 1, createdAt: -1 });
projectSchema.index({ industry: 1 });

module.exports = mongoose.model('Project', projectSchema);
