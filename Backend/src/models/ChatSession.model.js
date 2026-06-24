const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['customer', 'admin', 'system'],
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
    actionLabel: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    actionHref: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
  },
  { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    socketId: {
      type: String,
      default: '',
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
    online: {
      type: Boolean,
      default: false,
    },
    unreadCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    lastMessage: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    lastSender: {
      type: String,
      enum: ['customer', 'admin', 'system', ''],
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    ratingComment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    ratedAt: {
      type: Date,
      default: null,
    },
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

chatSessionSchema.index({ status: 1, lastMessageAt: -1 });
chatSessionSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
