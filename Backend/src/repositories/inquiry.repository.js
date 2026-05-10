class InquiryRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new inquiry.
   */
  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  /**
   * Paginated list with optional search, status filter, sort.
   */
  async findAll({ search, status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = {}) {
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a single inquiry by ID.
   */
  async findById(id) {
    return this.model.findOne({ _id: id, isActive: true }).lean();
  }

  /**
   * Update inquiry status.
   */
  async updateStatus(id, status) {
    return this.model
      .findOneAndUpdate(
        { _id: id, isActive: true },
        { status },
        { new: true, runValidators: true }
      )
      .lean();
  }

  /**
   * Soft delete an inquiry.
   */
  async softDelete(id) {
    return this.model
      .findOneAndUpdate({ _id: id }, { isActive: false }, { new: true })
      .lean();
  }

  /**
   * Total count of active inquiries.
   */
  async count(filter = {}) {
    return this.model.countDocuments({ isActive: true, ...filter });
  }

  /**
   * Aggregate weekly inquiry counts for the last N weeks.
   * Returns array of { week, count } objects.
   */
  async getWeeklyCounts(weeksBack = 8) {
    const since = new Date();
    since.setDate(since.getDate() - weeksBack * 7);

    return this.model.aggregate([
      { $match: { createdAt: { $gte: since }, isActive: true } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$createdAt' },
            week: { $isoWeek: '$createdAt' },
          },
          count: { $sum: 1 },
          weekStart: { $min: '$createdAt' },
        },
      },
      { $sort: { weekStart: 1 } },
      {
        $project: {
          _id: 0,
          week: {
            $dateToString: { format: '%Y-W%V', date: '$weekStart' },
          },
          weekStart: 1,
          count: 1,
        },
      },
    ]);
  }

  /**
   * Fetch all inquiries for CSV export (no pagination).
   */
  async findAllForExport() {
    return this.model
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('name email phone companyName country jobTitle jobDetails status createdAt')
      .lean();
  }
}

module.exports = InquiryRepository;
