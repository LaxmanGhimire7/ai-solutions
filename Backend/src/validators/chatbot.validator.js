const Joi = require('joi');
const ApiResponse = require('../utils/ApiResponse');

const messageSchema = Joi.object({
  message: Joi.string().trim().max(500).required().messages({
    'any.required': 'Message is required',
    'string.max': 'Message cannot exceed 500 characters',
  }),
});

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

module.exports = { messageSchema, validate };
