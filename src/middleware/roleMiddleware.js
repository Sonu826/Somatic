const { ApiError } = require('../utils/apiResponse');

/**
 * Role guard. Must run after authMiddleware (needs req.user.role).
 *
 * Usage: router.delete('/:id', authMiddleware, requireRole('ADMIN'), handler)
 */
function requireRole(...allowedRoles) {
  return function roleHandler(req, res, next) {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401, 'NO_AUTH'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError('Insufficient permissions for this action', 403, 'FORBIDDEN'));
    }
    next();
  };
}

module.exports = requireRole;
