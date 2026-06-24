const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class InquiryController {
  constructor(inquiryService) {
    this.service = inquiryService;

    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.delete = this.delete.bind(this);
    this.getDashboardStats = this.getDashboardStats.bind(this);
    this.exportCsv = this.exportCsv.bind(this);
  }

  /**
   * POST /api/inquiries
   * Public — anyone can submit
   */
  create = asyncHandler(async (req, res) => {
    const inquiry = await this.service.create(req.body);
    res.status(201).json(
      ApiResponse.success(inquiry, 'Inquiry submitted successfully', 201)
    );
  });

  /**
   * GET /api/inquiries
   * Admin only — paginated, filterable, sortable
   */
  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.getAll(req.query);
    res.status(200).json(
      ApiResponse.paginated(result.data, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      }, 'Inquiries fetched successfully')
    );
  });

  /**
   * GET /api/inquiries/:id
   * Admin only
   */
  getById = asyncHandler(async (req, res) => {
    const inquiry = await this.service.getById(req.params.id);
    res.status(200).json(ApiResponse.success(inquiry, 'Inquiry fetched'));
  });

  /**
   * PATCH /api/inquiries/:id/status
   * Admin only
   */
  updateStatus = asyncHandler(async (req, res) => {
    const inquiry = await this.service.updateStatus(req.params.id, req.body.status);
    res.status(200).json(ApiResponse.success(inquiry, 'Status updated'));
  });

  /**
   * DELETE /api/inquiries/:id
   * Admin only — soft delete
   */
  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    res.status(204).send();
  });

  /**
   * GET /api/inquiries/stats
   * Admin only — dashboard statistics
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await this.service.getDashboardStats();
    res.status(200).json(ApiResponse.success(stats, 'Stats fetched'));
  });

  /**
   * GET /api/inquiries/export-csv
   * Admin only — returns CSV file download
   */
  exportCsv = asyncHandler(async (req, res) => {
    const csv = await this.service.exportCsv();
    const filename = `inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  });
}

module.exports = InquiryController;
