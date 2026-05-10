const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Generic content controller.
 * Used by Article, Event, Gallery, Testimonial routes.
 */
class ContentController {
  constructor(service) {
    this.service = service;
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getAllAdmin = this.getAllAdmin.bind(this);
    this.getById = this.getById.bind(this);
    this.getBySlug = this.getBySlug.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /** POST / — Admin */
  create = asyncHandler(async (req, res) => {
    const doc = await this.service.create(req.body);
    res.status(201).json(ApiResponse.success(doc, 'Created successfully', 201));
  });

  /** GET / — Public (published only) */
  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.getAll(req.query, false);
    res.status(200).json(
      ApiResponse.paginated(result.data, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      }, 'Fetched successfully')
    );
  });

  /** GET /admin — Admin (all, including unpublished) */
  getAllAdmin = asyncHandler(async (req, res) => {
    const result = await this.service.getAll(req.query, true);
    res.status(200).json(
      ApiResponse.paginated(result.data, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      }, 'Fetched successfully')
    );
  });

  /** GET /:id */
  getById = asyncHandler(async (req, res) => {
    const doc = await this.service.getById(req.params.id, false);
    res.status(200).json(ApiResponse.success(doc, 'Fetched successfully'));
  });

  /** GET /slug/:slug */
  getBySlug = asyncHandler(async (req, res) => {
    const doc = await this.service.getBySlug(req.params.slug);
    res.status(200).json(ApiResponse.success(doc, 'Fetched successfully'));
  });

  /** PUT /:id — Admin */
  update = asyncHandler(async (req, res) => {
    const doc = await this.service.update(req.params.id, req.body);
    res.status(200).json(ApiResponse.success(doc, 'Updated successfully'));
  });

  /** DELETE /:id — Admin */
  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    res.status(204).send();
  });
}

module.exports = ContentController;
