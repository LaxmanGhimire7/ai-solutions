const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
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
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      default: '',
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    type: {
      type: String,
      enum: ['upcoming', 'past', 'online', 'in-person'],
      default: 'upcoming',
    },
    registrationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    published: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ eventDate: -1 });
eventSchema.index({ published: 1, eventDate: -1 });
eventSchema.index({ type: 1 });

module.exports = mongoose.model('Event', eventSchema);
