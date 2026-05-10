const router = require('express').Router();
const rateLimit = require('express-rate-limit');

const InquiryModel = require('../models/Inquiry.model');
const InquiryRepository = require('../repositories/inquiry.repository');
const InquiryService = require('../services/inquiry.service');
const InquiryController = require('../controllers/inquiry.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const validateObjectId = require('../middleware/validateObjectId');
const emailUtil = require('../utils/email');
const socketUtil = require('../utils/socket');
const {
  createSchema,
  updateStatusSchema,
  querySchema,
  validate,
} = require('../validators/inquiry.validator');

// ─── Dependency Injection Chain ───────────────────────────────────────────────
const inquiryRepo = new InquiryRepository(InquiryModel);
const inquiryService = new InquiryService(inquiryRepo, emailUtil, socketUtil);
const inquiryController = new InquiryController(inquiryService);

// ─── Rate limiter for public contact form (20 submissions per hour per IP) ────
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many submissions from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public — submit inquiry
router.post('/', submitLimiter, validate(createSchema), inquiryController.create);

// Admin — must be ordered: specific paths before parameterised paths
router.get('/stats', authenticateAdmin, inquiryController.getDashboardStats);
router.get('/export-csv', authenticateAdmin, inquiryController.exportCsv);
router.get('/', authenticateAdmin, validate(querySchema, 'query'), inquiryController.getAll);
router.get('/:id', authenticateAdmin, validateObjectId(), inquiryController.getById);
router.patch('/:id/status', authenticateAdmin, validateObjectId(), validate(updateStatusSchema), inquiryController.updateStatus);
router.delete('/:id', authenticateAdmin, validateObjectId(), inquiryController.delete);

module.exports = router;
