const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logStage } = require('../utils/logger');

/**
 * POST /api/auth/register
 * Public. Creates a farmer (or admin, if explicitly seeded) account.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, farmName } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError('An account with this email already exists', 409, 'EMAIL_TAKEN');
  }

  // Role is never accepted from the request body — always defaults to FARMER.
  // Admin accounts are provisioned separately (seed script / DB), never via
  // public self-registration.
  const user = await User.create({ name, email, phone, password, farmName, role: 'FARMER' });

  const token = generateToken(user);
  logStage('USER_REGISTERED', { userId: user._id.toString() });

  return sendSuccess(
    res,
    {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        farmName: user.farmName,
        role: user.role,
      },
    },
    201
  );
});

/**
 * POST /api/auth/login
 * Public.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user);
  logStage('USER_LOGIN', { userId: user._id.toString() });

  return sendSuccess(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      farmName: user.farmName,
      role: user.role,
    },
  });
});

/**
 * POST /api/auth/logout
 * Protected. JWTs are stateless, so this is a client-side no-op that
 * confirms intent — the frontend should discard the token.
 * (A token-blocklist can be added later if forced server-side logout
 * becomes a requirement, without changing this endpoint's contract.)
 */
const logout = asyncHandler(async (req, res) => {
  logStage('USER_LOGOUT', { userId: req.user.userId });
  return sendSuccess(res, { message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Protected. Returns the authenticated farmer's own profile.
 */
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }

  return sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      farmName: user.farmName,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

module.exports = { register, login, logout, me };
