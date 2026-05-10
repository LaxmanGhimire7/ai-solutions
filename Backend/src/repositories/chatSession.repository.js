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

  async findAll({ status, page = 1, limit = 20 } = {}) {
    const filter = { isActive: true };
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-messages') // Exclude messages in list view for performance
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async addMessage(sessionId, message) {
    return this.model
      .findByIdAndUpdate(
        sessionId,
        { $push: { messages: message } },
        { new: true, runValidators: true }
      )
      .lean();
  }

  async addMessageBySocketId(socketId, message) {
    return this.model
      .findOneAndUpdate(
        { socketId, isActive: true },
        { $push: { messages: message } },
        { new: true, runValidators: true }
      )
      .lean();
  }

  async updateStatus(socketId, status) {
    return this.model
      .findOneAndUpdate({ socketId }, { status }, { new: true })
      .lean();
  }

  async markMessagesRead(sessionId) {
    return this.model.updateOne(
      { _id: sessionId },
      { $set: { 'messages.$[elem].readByAdmin': true } },
      { arrayFilters: [{ 'elem.sender': 'customer', 'elem.readByAdmin': false }] }
    );
  }
}

module.exports = ChatSessionRepository;
