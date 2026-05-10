const router = require('express').Router();
const rateLimit = require('express-rate-limit');

const AdminModel = require('../models/Admin.model');
const AdminRepository = require('../repositories/admin.repository');
const AdminService = require('../services/admin.service');
const AdminController = require('../controllers/admin.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { loginSchema, seedSchema, validate } = require('../validators/admin.validator');

// ─── Dependency Injection Chain ───────────────────────────────────────────────
const adminRepo = new AdminRepository(AdminModel);
const adminService = new AdminService(adminRepo);
const adminController = new AdminController(adminService);

// ─── Rate Limiter for login (5 attempts per 15 minutes) ───────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, statusCode: 429, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public
router.post('/login', loginLimiter, validate(loginSchema), adminController.login);

// One-time setup — seed first admin (works only when no admin exists)
// ⚠️  Disable or remove this in production after initial setup
router.post('/seed', validate(seedSchema), adminController.seedFirstAdmin);

// Protected
router.get('/profile', authenticateAdmin, adminController.getProfile);

module.exports = router;
