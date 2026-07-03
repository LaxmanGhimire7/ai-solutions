const Joi = require('joi');
const ApiResponse = require('../utils/ApiResponse');

const mediaPathOrUrl = Joi.string()
  .trim()
  .max(1000)
  .custom((value, helpers) => {
    if (!value) return value;

    if (/^https?:\/\//i.test(value)) {
      try {
        new URL(value);
        return value;
      } catch {
        return helpers.error('any.invalid');
      }
    }

    if (/^\/?(uploads|images)\//i.test(value)) {
      return value;
    }

    return helpers.error('any.invalid');
  }, 'media URL or project media path')
  .messages({
    'any.invalid': '{{#label}} must be a valid URL or project media path',
  });

// ─── Article ──────────────────────────────────────────────────────────────────
const articleCreate = Joi.object({
  title: Joi.string().trim().max(200).required(),
  slug: Joi.string().trim().max(200).lowercase().optional(),
  summary: Joi.string().trim().max(500).required(),
  content: Joi.string().trim().max(50000).required(),
  coverImage: mediaPathOrUrl.allow('').optional(),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
  published: Joi.boolean().optional(),
});

const articleUpdate = articleCreate.fork(
  ['title', 'summary', 'content'],
  (field) => field.optional()
);

const serviceCreate = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(3000).required(),
  icon: Joi.string().trim().max(100).allow('').optional(),
  imageUrl: mediaPathOrUrl.allow('').optional(),
  order: Joi.number().integer().min(0).optional(),
  published: Joi.boolean().optional(),
});

const serviceUpdate = serviceCreate.fork(
  ['title', 'description'],
  (field) => field.optional()
);

const projectCreate = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(5000).required(),
  clientName: Joi.string().trim().max(150).allow('').optional(),
  industry: Joi.string().trim().max(100).allow('').optional(),
  imageUrl: mediaPathOrUrl.allow('').optional(),
  technologies: Joi.array().items(Joi.string().trim().max(50)).max(15).optional(),
  outcome: Joi.string().trim().max(1000).allow('').optional(),
  published: Joi.boolean().optional(),
});

const projectUpdate = projectCreate.fork(
  ['title', 'description'],
  (field) => field.optional()
);

// ─── Event ────────────────────────────────────────────────────────────────────
const eventCreate = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(3000).required(),
  coverImage: mediaPathOrUrl.allow('').optional(),
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
  imageUrl: mediaPathOrUrl.required(),
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
  authorAvatar: mediaPathOrUrl.allow('').optional(),
  quote: Joi.string().trim().max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  order: Joi.number().integer().min(0).optional(),
  published: Joi.boolean().optional(),
});

const testimonialUpdate = testimonialCreate.fork(
  ['authorName', 'quote'],
  (field) => field.optional()
);

const testimonialSubmission = Joi.object({
  authorName: Joi.string().trim().max(100).required(),
  authorTitle: Joi.string().trim().max(100).allow('').optional(),
  authorCompany: Joi.string().trim().max(100).allow('').optional(),
  quote: Joi.string().trim().min(10).max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
});

// ─── Shared query schema ──────────────────────────────────────────────────────
const contentQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  search: Joi.string().trim().max(100).allow('').optional(),
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
  serviceCreate, serviceUpdate,
  projectCreate, projectUpdate,
  eventCreate, eventUpdate,
  galleryCreate, galleryUpdate,
  testimonialCreate, testimonialUpdate, testimonialSubmission,
  contentQuery,
  validate,
};
