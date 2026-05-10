const Joi = require('joi');
const ApiResponse = require('../utils/ApiResponse');

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(1).required().messages({
    'any.required': 'Password is required',
  }),
});

const seedSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
  }),
});

/**
 * Middleware factory — validates req[source] against a Joi schema.
 * @param {Joi.Schema} schema
 * @param {'body'|'query'|'params'} source
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

module.exports = { loginSchema, seedSchema, validate };
