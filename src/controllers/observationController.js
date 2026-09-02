const ObservationQuestion = require('../models/ObservationQuestion');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/observations/questions
 * Protected. Returns the currently active observation questions.
 */
const getActiveQuestions = asyncHandler(async (req, res) => {
  const questions = await ObservationQuestion.find({ active: true })
    .sort({ order: 1 })
    .select('questionId question order -_id'); // Hide Mongo _id, use logical questionId

  return sendSuccess(res, { questions });
});

module.exports = { getActiveQuestions };