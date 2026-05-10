const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['customer', 'admin'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    readByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    socketId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'Anonymous',
    },
    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'missed'],
      default: 'active',
    },
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

chatSessionSchema.index({ status: 1, createdAt: -1 });
chatSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
