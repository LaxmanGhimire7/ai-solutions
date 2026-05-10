const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class AdminController {
  constructor(adminService) {
    this.service = adminService;

    // Bind methods so they work correctly as Express route handlers
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.seedFirstAdmin = this.seedFirstAdmin.bind(this);
  }

  /**
   * POST /api/admin/login
   * Public — no auth required
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await this.service.login(email, password);
    res.status(200).json(ApiResponse.success(result, 'Login successful'));
  });

  /**
   * GET /api/admin/profile
   * Protected — requires valid JWT
   */
  getProfile = asyncHandler(async (req, res) => {
    const profile = await this.service.getProfile(req.admin.adminId);
    res.status(200).json(ApiResponse.success(profile, 'Profile fetched'));
  });

  /**
   * POST /api/admin/seed
   * Public — but only works once (when no admins exist)
   * Remove this route in production after initial setup
   */
  seedFirstAdmin = asyncHandler(async (req, res) => {
    const admin = await this.service.seedFirstAdmin(req.body);
    res.status(201).json(ApiResponse.success(admin, 'Admin account created', 201));
  });
}

module.exports = AdminController;
