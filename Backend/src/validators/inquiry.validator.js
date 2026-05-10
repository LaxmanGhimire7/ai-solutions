const Joi = require('joi');
const ApiResponse = require('../utils/ApiResponse');

const createSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    'any.required': 'Name is required',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().trim().max(30).required().messages({
    'any.required': 'Phone is required',
    'string.max': 'Phone cannot exceed 30 characters',
  }),
  companyName: Joi.string().trim().max(150).required().messages({
    'any.required': 'Company name is required',
    'string.max': 'Company name cannot exceed 150 characters',
  }),
  country: Joi.string().trim().max(100).required().messages({
    'any.required': 'Country is required',
  }),
  jobTitle: Joi.string().trim().max(150).required().messages({
    'any.required': 'Job title is required',
    'string.max': 'Job title cannot exceed 150 characters',
  }),
  jobDetails: Joi.string().trim().max(2000).required().messages({
    'any.required': 'Job details are required',
    'string.max': 'Job details cannot exceed 2000 characters',
  }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('new', 'read', 'replied', 'archived')
    .required()
    .messages({
      'any.only': 'Status must be one of: new, read, replied, archived',
      'any.required': 'Status is required',
    }),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  search: Joi.string().trim().max(100).allow('').optional(),
  status: Joi.string().valid('new', 'read', 'replied', 'archived').optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'name', 'email', 'country', 'status')
    .default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

/**
 * Middleware factory — validates req[source] against a Joi schema.
 */
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

module.exports = { createSchema, updateStatusSchema, querySchema, validate };
