const Cow = require('../models/Cow');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logStage } = require('../utils/logger');

/**
 * GET /api/cows
 * Protected. Lists only the authenticated farmer's cows.
 * Supports optional filtering by active status, risk level, and a
 * simple name/cowId text search — enough for the "My Cows" screen
 * without over-building pagination this system doesn't need yet
 * (cow counts per farm are small; full pagination lives on /tests/history).
 */
const getCows = asyncHandler(async (req, res) => {
  const { active, riskLevel, search } = req.query;

  const filter = { farmerId: req.user.userId };
  if (active !== undefined) filter.active = active === 'true';
  if (riskLevel) filter.currentRiskLevel = riskLevel;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { cowId: { $regex: search, $options: 'i' } },
    ];
  }

  const cows = await Cow.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, { cows, count: cows.length });
});

/**
 * POST /api/cows
 * Protected. Creates a cow owned by the authenticated farmer.
 */
const createCow = asyncHandler(async (req, res) => {
  const farmerId = req.user.userId;

  const cow = await Cow.create({ ...req.body, farmerId });

  logStage('COW_REGISTERED', { cowId: cow._id.toString(), farmerId });
  return sendSuccess(res, { cow }, 201);
});

/**
 * Shared helper: fetch a cow the authenticated farmer actually owns,
 * or throw a 404. Deliberately returns 404 (not 403) for cows owned by
 * someone else, so ownership boundaries aren't leaked via status code.
 */
async function findOwnedCowOr404(cowMongoId, farmerId) {
  const cow = await Cow.findOne({ _id: cowMongoId, farmerId });
  if (!cow) {
    throw new ApiError('Cow not found', 404, 'COW_NOT_FOUND');
  }
  return cow;
}

/**
 * GET /api/cows/:id
 * Protected.
 */
const getCowById = asyncHandler(async (req, res) => {
  const cow = await findOwnedCowOr404(req.params.id, req.user.userId);
  return sendSuccess(res, { cow });
});

/**
 * PUT /api/cows/:id
 * Protected. Only updates fields present in the validated body.
 */
const updateCow = asyncHandler(async (req, res) => {
  const cow = await findOwnedCowOr404(req.params.id, req.user.userId);

  Object.assign(cow, req.body);
  await cow.save();

  logStage('COW_UPDATED', { cowId: cow._id.toString(), farmerId: req.user.userId });
  return sendSuccess(res, { cow });
});

/**
 * DELETE /api/cows/:id
 * Protected.
 */
const deleteCow = asyncHandler(async (req, res) => {
  const cow = await findOwnedCowOr404(req.params.id, req.user.userId);
  await cow.deleteOne();

  logStage('COW_DELETED', { cowId: cow._id.toString(), farmerId: req.user.userId });
  return sendSuccess(res, { message: 'Cow deleted successfully' });
});

module.exports = { getCows, createCow, getCowById, updateCow, deleteCow, findOwnedCowOr404 };
