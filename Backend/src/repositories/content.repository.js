/**
 * Generic CRUD repository used by all content types.
 * Each route file instantiates this with its own Mongoose model.
 */
class ContentRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  async findAll({ filter = {}, page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const baseFilter = { isActive: true, ...filter };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(baseFilter).sort(sort).skip(skip).limit(limit).lean(),
      this.model.countDocuments(baseFilter),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findPublished({ page = 1, limit = 20, sort = { createdAt: -1 }, extraFilter = {} } = {}) {
    return this.findAll({
      filter: { published: true, ...extraFilter },
      page,
      limit,
      sort,
    });
  }

  async findById(id, extraFilter = {}) {
    return this.model.findOne({ _id: id, isActive: true, ...extraFilter }).lean();
  }

  async findBySlug(slug) {
    return this.model.findOne({ slug, isActive: true, published: true }).lean();
  }

  async update(id, data) {
    return this.model
      .findOneAndUpdate(
        { _id: id, isActive: true },
        data,
        { new: true, runValidators: true }
      )
      .lean();
  }

  async softDelete(id) {
    return this.model
      .findOneAndUpdate({ _id: id }, { isActive: false }, { new: true })
      .lean();
  }
}

module.exports = ContentRepository;
