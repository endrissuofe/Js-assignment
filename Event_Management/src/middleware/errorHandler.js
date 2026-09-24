const ApiError = require('../utils/ApiError');

/** 404 for routes that don't exist. */
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/** Central error handler - every error ends up here with a consistent JSON shape. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongo duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(err.keyValue).join(', ')} already exists`;
  }
  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    ...(err.details && { errors: err.details }),
  });
}

module.exports = { notFound, errorHandler };
