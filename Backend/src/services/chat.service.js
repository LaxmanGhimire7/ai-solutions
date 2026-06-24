const mongoose = require('mongoose');

class ChatService {
  constructor(chatSessionRepository, socketUtil) {
    this.chatRepo = chatSessionRepository;
    this.socketUtil = socketUtil;
  }

  /**
   * Called when a customer connects via Socket.io.
   * Creates a new chat session.
   */
  async startSession({ socketId, sessionId, customerName, customerEmail }) {
    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      const resumed = await this.chatRepo.resumeSession(sessionId, {
        socketId,
        customerName,
        customerEmail,
      });

      if (resumed) return resumed;
    }

    return this.chatRepo.create({
      socketId,
      customerName: customerName || 'Anonymous',
      customerEmail: customerEmail || '',
      status: 'active',
      online: true,
      lastMessageAt: new Date(),
      messages: [],
    });
  }

  /**
   * Handle an incoming message from a customer.
   * Persists and broadcasts to admin room.
   */
  async handleCustomerMessage({ sessionId, socketId, content }) {
    const cleanContent = String(content || '').trim();
    if (!cleanContent) {
      const err = new Error('Message is required');
      err.statusCode = 400;
      throw err;
    }

    const message = { sender: 'customer', content: cleanContent, readByAdmin: false };
    const session = await this.chatRepo.addCustomerMessage(sessionId, socketId, message);

    if (!session) {
      const err = new Error('Active chat session not found');
      err.statusCode = 404;
      throw err;
    }

    const savedMessage = session.messages[session.messages.length - 1];
    const isFirstCustomerMessage =
      session.messages.filter((item) => item.sender === 'customer').length === 1;
    let autoReply = null;

    if (isFirstCustomerMessage) {
      const adminOnline = this.socketUtil.roomSize('admin_room') > 0;
      const reply = adminOnline
        ? {
            sender: 'system',
            content:
              'Thank you for messaging AI-Solutions. A support administrator is online and will reply as soon as possible. You can continue typing your message here.',
            readByAdmin: true,
          }
        : {
            sender: 'system',
            content:
              'Thank you for messaging AI-Solutions. Our support team is offline right now. Leave your message and we will reply when available, or submit your full inquiry through the Contact form.',
            actionLabel: 'Open Contact Form',
            actionHref: '/contact',
            readByAdmin: true,
          };

      const sessionWithReply = await this.chatRepo.addSystemMessage(sessionId, reply);
      autoReply = sessionWithReply.messages[sessionWithReply.messages.length - 1];
      this.socketUtil.emitToRoom(`chat:${sessionId}`, 'support_auto_reply', {
        sessionId,
        message: autoReply,
        supportOnline: adminOnline,
      });
      this.socketUtil.emitToRoom('admin_room', 'system_message', {
        sessionId,
        message: autoReply,
      });
    }

    const payload = {
      sessionId: session._id,
      socketId,
      customerName: session.customerName,
      customerEmail: session.customerEmail,
      message: savedMessage,
      unreadCount: session.unreadCount,
      lastMessageAt: session.lastMessageAt,
    };

    this.socketUtil.emitToRoom('admin_room', 'customer_message', payload);

    return { session, message: savedMessage, autoReply };
  }

  /**
   * Admin sends a reply to a specific customer.
   */
  async handleAdminReply({ sessionId, content }) {
    const cleanContent = String(content || '').trim();
    if (!cleanContent) {
      const err = new Error('Message is required');
      err.statusCode = 400;
      throw err;
    }

    const message = { sender: 'admin', content: cleanContent, readByAdmin: true };
    const session = await this.chatRepo.addAdminMessage(sessionId, message);

    if (!session) {
      const err = new Error('Chat session not found');
      err.statusCode = 404;
      throw err;
    }

    const savedMessage = session.messages[session.messages.length - 1];
    const payload = {
      sessionId: session._id,
      message: savedMessage,
      lastMessageAt: session.lastMessageAt,
    };

    this.socketUtil.emitToRoom(`chat:${sessionId}`, 'admin_reply', payload);
    this.socketUtil.emitToRoom('admin_room', 'admin_message', payload);

    return payload;
  }

  async setPresence(sessionId, online, socketId = '') {
    const session = await this.chatRepo.setPresence(sessionId, online, socketId);
    if (session) {
      this.socketUtil.emitToRoom('admin_room', 'session_presence', {
        sessionId: session._id,
        online: session.online,
      });
    }
    return session;
  }

  async updateStatus(sessionId, status) {
    if (!['active', 'closed'].includes(status)) {
      const err = new Error('Status must be active or closed');
      err.statusCode = 400;
      throw err;
    }

    const session = await this.chatRepo.updateStatusById(sessionId, status);
    if (!session) {
      const err = new Error('Chat session not found');
      err.statusCode = 404;
      throw err;
    }

    const payload = {
      sessionId: session._id,
      status: session.status,
      closedAt: session.closedAt,
    };
    this.socketUtil.emitToRoom(`chat:${sessionId}`, 'chat_status', payload);
    this.socketUtil.emitToRoom('admin_room', 'chat_status', payload);
    return session;
  }

  async submitRating(sessionId, rating, ratingComment = '') {
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      const err = new Error('Rating must be a whole number from 1 to 5');
      err.statusCode = 400;
      throw err;
    }

    const cleanComment = String(ratingComment || '').trim().slice(0, 500);
    const session = await this.chatRepo.submitRating(sessionId, numericRating, cleanComment);
    if (!session) {
      const err = new Error('Only completed conversations can be rated');
      err.statusCode = 409;
      throw err;
    }

    const payload = {
      sessionId: session._id,
      rating: session.rating,
      ratingComment: session.ratingComment,
      ratedAt: session.ratedAt,
    };
    this.socketUtil.emitToRoom('admin_room', 'chat_rating', payload);
    return session;
  }

  async deleteConversation(sessionId) {
    const deleted = await this.chatRepo.deleteClosed(sessionId);
    if (!deleted) {
      const err = new Error('Only completed conversations can be deleted');
      err.statusCode = 409;
      throw err;
    }

    const payload = { sessionId: deleted._id };
    this.socketUtil.emitToRoom(`chat:${sessionId}`, 'chat_deleted', payload);
    this.socketUtil.emitToRoom('admin_room', 'chat_deleted', payload);
    return deleted;
  }

  /**
   * Get paginated list of sessions (admin dashboard).
   */
  async getSessions(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, parseInt(query.limit, 10) || 20);
    const search = String(query.search || '').trim().slice(0, 100);
    return this.chatRepo.findAll({ status: query.status, search, page, limit });
  }

  /**
   * Get full session with messages (admin view).
   */
  async getSessionById(id) {
    await this.chatRepo.markMessagesRead(id);
    const session = await this.chatRepo.findById(id);
    if (!session) {
      const err = new Error('Chat session not found');
      err.statusCode = 404;
      throw err;
    }
    return session;
  }
}

module.exports = ChatService;
