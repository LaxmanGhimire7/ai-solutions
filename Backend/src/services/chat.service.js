class ChatService {
  constructor(chatSessionRepository, socketUtil) {
    this.chatRepo = chatSessionRepository;
    this.socketUtil = socketUtil;
  }

  /**
   * Called when a customer connects via Socket.io.
   * Creates a new chat session.
   */
  async startSession({ socketId, customerName, customerEmail }) {
    return this.chatRepo.create({
      socketId,
      customerName: customerName || 'Anonymous',
      customerEmail: customerEmail || '',
      status: 'active',
      messages: [],
    });
  }

  /**
   * Handle an incoming message from a customer.
   * Persists and broadcasts to admin room.
   */
  async handleCustomerMessage({ socketId, content }) {
    const message = { sender: 'customer', content, readByAdmin: false };
    const session = await this.chatRepo.addMessageBySocketId(socketId, message);

    if (!session) return null;

    const payload = {
      sessionId: session._id,
      socketId,
      customerName: session.customerName,
      message: content,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all connected admins
    this.socketUtil.emitToRoom('admin_room', 'customer_message', payload);

    return session;
  }

  /**
   * Admin sends a reply to a specific customer.
   */
  async handleAdminReply({ sessionId, targetSocketId, content }) {
    const message = { sender: 'admin', content };
    await this.chatRepo.addMessage(sessionId, message);

    // Send directly to the customer's socket
    this.socketUtil.emitToRoom(targetSocketId, 'admin_reply', {
      message: content,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Close a session when customer disconnects.
   */
  async closeSession(socketId) {
    return this.chatRepo.updateStatus(socketId, 'closed');
  }

  /**
   * Get paginated list of sessions (admin dashboard).
   */
  async getSessions(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, parseInt(query.limit, 10) || 20);
    return this.chatRepo.findAll({ status: query.status, page, limit });
  }

  /**
   * Get full session with messages (admin view).
   */
  async getSessionById(id) {
    const session = await this.chatRepo.findById(id);
    if (!session) {
      const err = new Error('Chat session not found');
      err.statusCode = 404;
      throw err;
    }
    await this.chatRepo.markMessagesRead(id);
    return session;
  }
}

module.exports = ChatService;
