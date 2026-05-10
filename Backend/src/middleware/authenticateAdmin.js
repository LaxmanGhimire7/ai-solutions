const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware to protect admin routes.
 * Verifies the JWT from the Authorization header.
 * Attaches decoded payload to req.admin.
 */
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(ApiResponse.error('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json(ApiResponse.error('Insufficient permissions', 403));
    }

    req.admin = decoded; // { adminId, email, role, iat, exp }
    next();
  } catch (err) {
    next(err); // Handled by errorHandler (JsonWebTokenError / TokenExpiredError)
  }
};

module.exports = authenticateAdmin;
