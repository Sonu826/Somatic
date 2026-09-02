const { ApiError } = require('../utils/apiResponse');

/**
 * Catches any request that didn't match a route and forwards a
 * consistent 404 ApiError into the central error handler.
 */
function notFoundMiddleware(req, res, next) {
  next(new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
}

module.exports = notFoundMiddleware;
