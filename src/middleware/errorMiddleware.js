const { logger } = require('../utils/logger');
const env = require('../config/env');

/**
 * Centralized error handler. Every thrown/forwarded error ends up here
 * so response shape stays consistent across the whole API.
 *
 * Recognizes:
 * - ApiError instances (explicit statusCode/errorCode from services/controllers)
 * - Mongoose ValidationError / CastError
 * - JWT errors
 * - Falls back to 500 INTERNAL_ERROR otherwise
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = `Invalid value for field "${err.path}"`;
  } else if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    message = 'A record with this value already exists';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  logger.error('Request error', {
    statusCode,
    errorCode,
    message,
    path: req.originalUrl,
    method: req.method,
    stack: env.isProduction() ? undefined : err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
}

module.exports = errorMiddleware;
