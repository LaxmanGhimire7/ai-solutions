const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class DashboardController {
  constructor(inquiryService) {
    this.inquiryService = inquiryService;
    this.getStats = this.getStats.bind(this);
    this.getWeeklyInquiries = this.getWeeklyInquiries.bind(this);
    this.exportCsv = this.exportCsv.bind(this);
  }

  getStats = asyncHandler(async (req, res) => {
    const stats = await this.inquiryService.getDashboardStats();
    res.status(200).json(ApiResponse.success(stats, 'Dashboard stats fetched'));
  });

  getWeeklyInquiries = asyncHandler(async (req, res) => {
    const weeklyData = await this.inquiryService.getWeeklyInquiries();
    res.status(200).json(ApiResponse.success(weeklyData, 'Weekly inquiry data fetched'));
  });

  exportCsv = asyncHandler(async (req, res) => {
    const csv = await this.inquiryService.exportCsv();
    const filename = `inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(csv);
  });
}

module.exports = DashboardController;
