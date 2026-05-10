const slugify = require('../utils/slugify');

/**
 * Generic content service.
 * Instantiated with a repository and optional config per content type.
 */
class ContentService {
  /**
   * @param {ContentRepository} repository
   * @param {{ hasSlug?: boolean, hasPublished?: boolean }} options
   */
  constructor(repository, options = {}) {
    this.repo = repository;
    this.hasSlug = options.hasSlug || false;
  }

  async create(data) {
    if (this.hasSlug && data.title && !data.slug) {
      data.slug = slugify(data.title);
    }
    if (data.published && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    return this.repo.create(data);
  }

  async getAll(query = {}, adminView = false) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, parseInt(query.limit, 10) || 20);
    const filter = adminView ? {} : { published: true };

    if (query.category) filter.category = query.category;
    if (query.type) filter.type = query.type;
    if (query.tag) filter.tags = query.tag;

    const sort = {};
    const sortBy = query.sortBy || 'createdAt';
    sort[sortBy] = query.order === 'asc' ? 1 : -1;

    return this.repo.findAll({ filter, page, limit, sort });
  }

  async getById(id) {
    const doc = await this.repo.findById(id);
    if (!doc) {
      const err = new Error('Not found');
      err.statusCode = 404;
      throw err;
    }
    return doc;
  }

  async getBySlug(slug) {
    const doc = await this.repo.findBySlug(slug);
    if (!doc) {
      const err = new Error('Not found');
      err.statusCode = 404;
      throw err;
    }
    return doc;
  }

  async update(id, data) {
    if (this.hasSlug && data.title && !data.slug) {
      data.slug = slugify(data.title);
    }
    if (data.published && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const doc = await this.repo.update(id, data);
    if (!doc) {
      const err = new Error('Not found');
      err.statusCode = 404;
      throw err;
    }
    return doc;
  }

  async delete(id) {
    const doc = await this.repo.softDelete(id);
    if (!doc) {
      const err = new Error('Not found');
      err.statusCode = 404;
      throw err;
    }
  }
}

module.exports = ContentService;
