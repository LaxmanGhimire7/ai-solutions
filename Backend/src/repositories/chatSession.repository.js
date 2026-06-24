class ChatSessionRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  async findBySocketId(socketId) {
    return this.model.findOne({ socketId, isActive: true }).lean();
  }

  async findById(id) {
    return this.model.findOne({ _id: id, isActive: true }).lean();
  }

  async resumeSession(id, data) {
    const filter = { _id: id, isActive: true };
    if (data.customerEmail) {
      filter.customerEmail = data.customerEmail.toLowerCase().trim();
    }

    return this.model
      .findOneAndUpdate(
        filter,
        {
          $set: {
            socketId: data.socketId,
            online: true,
            ...(data.customerName ? { customerName: data.customerName } : {}),
            ...(data.customerEmail ? { customerEmail: data.customerEmail } : {}),
          },
        },
        { new: true, runValidators: true }
      )
      .lean();
  }

  async findAll({ status, search, page = 1, limit = 50 } = {}) {
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { lastMessage: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ lastMessageAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-messages')
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async addAdminMessage(sessionId, message) {
    const now = new Date();
    return this.model
      .findOneAndUpdate(
        { _id: sessionId, isActive: true, status: 'active' },
        {
          $push: { messages: { ...message, createdAt: now, updatedAt: now } },
          $set: {
            lastMessage: message.content,
            lastSender: 'admin',
            lastMessageAt: now,
          },
        },
        { new: true, runValidators: true }
      )
      .lean();
  }

  async addCustomerMessage(sessionId, socketId, message) {
    const now = new Date();
    return this.model
      .findOneAndUpdate(
        { _id: sessionId, isActive: true, status: 'active' },
        {
          $push: { messages: { ...message, createdAt: now, updatedAt: now } },
          $set: {
            socketId,
            online: true,
            lastMessage: message.content,
            lastSender: 'customer',
            lastMessageAt: now,
          },
          $inc: { unreadCount: 1 },
        },
        { new: true, runValidators: true }
      )
      .lean();
  }

  async addSystemMessage(sessionId, message) {
    const now = new Date();
    return this.model
      .findOneAndUpdate(
        { _id: sessionId, isActive: true, status: 'active' },
        {
          $push: { messages: { ...message, createdAt: now, updatedAt: now } },
        },
        { new: true, runValidators: true }
      )
      .lean();
  }

  async setPresence(sessionId, online, socketId = '') {
    return this.model
      .findOneAndUpdate(
        { _id: sessionId, isActive: true },
        { $set: { online, ...(socketId ? { socketId } : {}) } },
        { new: true }
      )
      .select('-messages')
      .lean();
  }

  async updateStatusById(sessionId, status) {
    return this.model
      .findOneAndUpdate(
        { _id: sessionId, isActive: true },
        {
          $set: {
            status,
            closedAt: status === 'closed' ? new Date() : null,
            ...(status === 'active' ? { lastMessageAt: new Date() } : {}),
          },
        },
        { new: true, runValidators: true }
      )
      .lean();
  }

  async submitRating(sessionId, rating, ratingComment) {
    return this.model
      .findOneAndUpdate(
        { _id: sessionId, isActive: true, status: 'closed' },
        {
          $set: {
            rating,
            ratingComment,
            ratedAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      )
      .lean();
  }

  async deleteClosed(sessionId) {
    return this.model.findOneAndDelete({
      _id: sessionId,
      isActive: true,
      status: 'closed',
    });
  }

  async markMessagesRead(sessionId) {
    return this.model.updateOne(
      { _id: sessionId },
      {
        $set: {
          'messages.$[elem].readByAdmin': true,
          unreadCount: 0,
        },
      },
      { arrayFilters: [{ 'elem.sender': 'customer', 'elem.readByAdmin': false }] }
    );
  }
}

module.exports = ChatSessionRepository;
