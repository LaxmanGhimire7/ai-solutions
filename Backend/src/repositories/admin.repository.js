class AdminRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Find admin by email — includes password for authentication.
   */
  async findByEmailWithPassword(email) {
    return this.model.findOne({ email, isActive: true }).select('+password').lean();
  }

  /**
   * Find admin by ID — no password.
   */
  async findById(id) {
    return this.model.findById(id).lean();
  }

  /**
   * Create a new admin account.
   */
  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  /**
   * Update last login timestamp.
   */
  async updateLastLogin(id) {
    return this.model.findByIdAndUpdate(
      id,
      { lastLoginAt: new Date() },
      { new: true }
    ).lean();
  }

  /**
   * Count total active admins.
   */
  async countActive() {
    return this.model.countDocuments({ isActive: true });
  }
}

module.exports = AdminRepository;
