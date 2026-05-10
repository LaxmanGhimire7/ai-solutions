/**
 * Wraps async route handlers to automatically pass errors to Express error middleware.
 * Eliminates the need for try/catch in every controller method.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
