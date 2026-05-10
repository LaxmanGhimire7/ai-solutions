const router = require('express').Router();

const InquiryModel = require('../models/Inquiry.model');
const InquiryRepository = require('../repositories/inquiry.repository');
const InquiryService = require('../services/inquiry.service');
const DashboardController = require('../controllers/dashboard.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const emailUtil = require('../utils/email');
const socketUtil = require('../utils/socket');

const inquiryRepo = new InquiryRepository(InquiryModel);
const inquiryService = new InquiryService(inquiryRepo, emailUtil, socketUtil);
const dashboardController = new DashboardController(inquiryService);

router.get('/stats', authenticateAdmin, dashboardController.getStats);
router.get('/weekly-inquiries', authenticateAdmin, dashboardController.getWeeklyInquiries);
router.get('/export-csv', authenticateAdmin, dashboardController.exportCsv);

module.exports = router;
