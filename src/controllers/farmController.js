const farmService = require('../services/farm/farmService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get overall farm health analytics
 * @route   GET /api/farm/health
 * @access  Private (FARMER)
 */
exports.getFarmHealth = asyncHandler(async (req, res) => {
    const farmerId = req.user.userId;
    const farmHealthData = await farmService.getFarmHealthAnalytics(farmerId);

    return successResponse(res, farmHealthData, 'Farm health data retrieved successfully');
});