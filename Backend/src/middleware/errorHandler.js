const ApiResponse = require('../utils/ApiResponse');

/**
 * Global error handling middleware.
 * Must be registered LAST in Express middleware chain.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json(ApiResponse.error(messages, 400));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res
      .status(409)
      .json(ApiResponse.error(`${field} already exists`, 409));
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json(ApiResponse.error('Invalid ID format', 400));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.error('Invalid token', 401));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.error('Token expired', 401));
  }

  // Custom app errors with statusCode
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json(ApiResponse.error(message, statusCode));
};

module.exports = errorHandler;
