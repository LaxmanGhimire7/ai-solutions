const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');

const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(ApiResponse.error('Invalid ID format', 400));
  }

  next();
};

module.exports = validateObjectId;
