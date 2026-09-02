const reportService = require('../services/report/reportService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get detailed test report JSON
 * @route   GET /api/reports/tests/:testId
 * @access  Private (FARMER)
 */
exports.getTestReport = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const farmerId = req.user.userId;

    const reportData = await reportService.generateTestReport(testId, farmerId);

    return successResponse(res, reportData, 'Test report generated successfully');
});