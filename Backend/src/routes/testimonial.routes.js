const router = require('express').Router();
const rateLimit = require('express-rate-limit');

const TestimonialModel = require('../models/Testimonial.model');
const ContentRepository = require('../repositories/content.repository');
const ContentService = require('../services/content.service');
const ContentController = require('../controllers/content.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const validateObjectId = require('../middleware/validateObjectId');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const {
  testimonialCreate,
  testimonialUpdate,
  testimonialSubmission,
  contentQuery,
  validate,
} = require('../validators/content.validator');

const repo = new ContentRepository(TestimonialModel);
const service = new ContentService(repo, { hasSlug: false });
const controller = new ContentController(service);
const reviewSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: ApiResponse.error('Too many review submissions. Please try again later.', 429),
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.get('/', validate(contentQuery, 'query'), controller.getAll);
router.post(
  '/submit',
  reviewSubmissionLimiter,
  validate(testimonialSubmission),
  asyncHandler(async (req, res) => {
    const testimonial = await service.create({
      ...req.body,
      published: false,
      order: 0,
      submissionSource: 'customer',
    });

    res
      .status(201)
      .json(
        ApiResponse.success(
          { id: testimonial._id },
          'Thank you. Your review was submitted for administrator approval.',
          201
        )
      );
  })
);

// Admin
router.get('/admin/all', authenticateAdmin, validate(contentQuery, 'query'), controller.getAllAdmin);
router.post('/', authenticateAdmin, validate(testimonialCreate), controller.create);
router.put('/:id', authenticateAdmin, validateObjectId(), validate(testimonialUpdate), controller.update);
router.delete('/:id', authenticateAdmin, validateObjectId(), controller.delete);

router.get('/:id', validateObjectId(), controller.getById);

module.exports = router;
