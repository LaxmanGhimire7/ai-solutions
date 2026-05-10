const Joi = require('joi');
const ApiResponse = require('../utils/ApiResponse');

// ─── Article ──────────────────────────────────────────────────────────────────
const articleCreate = Joi.object({
  title: Joi.string().trim().max(200).required(),
  slug: Joi.string().trim().max(200).lowercase().optional(),
  summary: Joi.string().trim().max(500).required(),
  content: Joi.string().trim().max(50000).required(),
  coverImage: Joi.string().trim().uri().allow('').optional(),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
  published: Joi.boolean().optional(),
});

const articleUpdate = articleCreate.fork(
  ['title', 'summary', 'content'],
  (field) => field.optional()
);

// ─── Event ────────────────────────────────────────────────────────────────────
const eventCreate = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(3000).required(),
  coverImage: Joi.string().trim().uri().allow('').optional(),
  location: Joi.string().trim().max(200).allow('').optional(),
  eventDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('eventDate')).optional().allow(null),
  type: Joi.string().valid('upcoming', 'past', 'online', 'in-person').optional(),
  registrationUrl: Joi.string().trim().uri().allow('').optional(),
  published: Joi.boolean().optional(),
});

const eventUpdate = eventCreate.fork(
  ['title', 'description', 'eventDate'],
  (field) => field.optional()
);

// ─── Gallery ──────────────────────────────────────────────────────────────────
const galleryCreate = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(500).allow('').optional(),
  imageUrl: Joi.string().trim().uri().required(),
  category: Joi.string().trim().max(100).optional(),
  order: Joi.number().integer().min(0).optional(),
  published: Joi.boolean().optional(),
});

const galleryUpdate = galleryCreate.fork(
  ['title', 'imageUrl'],
  (field) => field.optional()
);

// ─── Testimonial ──────────────────────────────────────────────────────────────
const testimonialCreate = Joi.object({
  authorName: Joi.string().trim().max(100).required(),
  authorTitle: Joi.string().trim().max(100).allow('').optional(),
  authorCompany: Joi.string().trim().max(100).allow('').optional(),
  authorAvatar: Joi.string().trim().uri().allow('').optional(),
  quote: Joi.string().trim().max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  order: Joi.number().integer().min(0).optional(),
  published: Joi.boolean().optional(),
});

const testimonialUpdate = testimonialCreate.fork(
  ['authorName', 'quote'],
  (field) => field.optional()
);

// ─── Shared query schema ──────────────────────────────────────────────────────
const contentQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  sortBy: Joi.string().max(50).optional(),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  category: Joi.string().trim().max(100).optional(),
  type: Joi.string().trim().max(50).optional(),
  tag: Joi.string().trim().max(50).optional(),
});

// ─── Validate middleware factory ──────────────────────────────────────────────
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return res.status(400).json(ApiResponse.error(messages, 400));
  }
  req[source] = value;
  next();
};

module.exports = {
  articleCreate, articleUpdate,
  eventCreate, eventUpdate,
  galleryCreate, galleryUpdate,
  testimonialCreate, testimonialUpdate,
  contentQuery,
  validate,
};
