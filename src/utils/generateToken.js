const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generates a signed JWT.
 *
 * IMPORTANT: keep the payload minimal. Only userId + role — never email,
 * name, or anything else that could go stale or leak sensitive info.
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

module.exports = generateToken;
