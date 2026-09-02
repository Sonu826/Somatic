const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ApiError } = require('../utils/apiResponse');

/**
 * Verifies the Authorization: Bearer <token> header and attaches
 * req.user = { userId, role } for downstream handlers.
 *
 * Every protected route must use this. Controllers/services should
 * always derive farmerId from req.user.userId — never trust an ID
 * sent in the request body/params for ownership purposes.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError('Authentication token missing', 401, 'NO_TOKEN'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    // errorMiddleware already knows how to translate JsonWebTokenError /
    // TokenExpiredError, so just forward it.
    next(err);
  }
}

module.exports = authMiddleware;
