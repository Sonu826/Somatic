const { v4: uuidv4 } = require('uuid');
const Test = require('../models/Test');
const Cow = require('../models/Cow');
const ObservationQuestion = require('../models/ObservationQuestion');
const { ApiError } = require('../utils/apiResponse');
const { logStage } = require('../utils/logger');

/**
 * Ensures strict linear progression of a milk test.
 */
const VALID_TRANSITIONS = {
  CREATED: ['OBSERVATION_PENDING', 'CANCELLED'],
  OBSERVATION_PENDING: ['OBSERVATION_COMPLETED', 'CANCELLED'],
  OBSERVATION_COMPLETED: ['WAITING_FOR_DEVICE', 'CANCELLED'],
  WAITING_FOR_DEVICE: ['SENDING_TO_ML', 'CANCELLED', 'FAILED'], // Updated for final IoT payload flow
  SENDING_TO_ML: ['CALCULATING_RISK', 'FAILED'],
  CALCULATING_RISK: ['COMPLETED', 'FAILED'],
};

function requireValidTransition(currentStatus, targetStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new ApiError(
      `Invalid test state transition from ${currentStatus} to ${targetStatus}`,
      400,
      'INVALID_STATE_TRANSITION'
    );
  }
}

async function startTest(farmerId, cowId) {
  const cow = await Cow.findOne({ _id: cowId, farmerId });
  if (!cow) throw new ApiError('Cow not found', 404, 'COW_NOT_FOUND');

  const activeTest = await Test.findOne({
    cowId,
    status: { $nin: ['COMPLETED', 'FAILED', 'CANCELLED'] }
  });

  if (activeTest) {
    throw new ApiError('Cow already has an active test session', 409, 'ACTIVE_TEST_EXISTS');
  }

  const testId = `TST-${uuidv4().slice(0, 8).toUpperCase()}`;

  const test = await Test.create({
    testId,
    farmerId,
    cowId,
    status: 'OBSERVATION_PENDING'
  });

  logStage('TEST_CREATED', { testId, cowId: cow._id.toString(), farmerId });
  return test;
}

async function submitObservations(testId, farmerId, frontendAnswers) {
  const test = await Test.findOne({ testId, farmerId });
  if (!test) throw new ApiError('Test not found', 404, 'TEST_NOT_FOUND');

  requireValidTransition(test.status, 'OBSERVATION_COMPLETED');

  const activeQuestions = await ObservationQuestion.find({ active: true });
  
  let positiveFlags = 0;
  const processedAnswers = frontendAnswers.map(ans => {
    const q = activeQuestions.find(dbQ => dbQ.questionId === ans.questionId);
    if (!q) throw new ApiError(`Unknown question ID: ${ans.questionId}`, 400);

    const score = ans.answer === 'YES' ? q.riskScoreFlag : 0;
    if (ans.answer === 'YES') positiveFlags += 1;

    return {
      questionId: q.questionId,
      question: q.question,
      answer: ans.answer,
      score
    };
  });

  test.observations = {
    total: processedAnswers.length,
    positiveFlags,
    answers: processedAnswers
  };
  
  test.status = 'OBSERVATION_COMPLETED';
  await test.save();

  logStage('OBSERVATION_COMPLETED', { testId, positiveFlags });
  return test;
}

async function readyForDevice(testId, farmerId) {
  const test = await Test.findOne({ testId, farmerId });
  if (!test) throw new ApiError('Test not found', 404, 'TEST_NOT_FOUND');

  requireValidTransition(test.status, 'WAITING_FOR_DEVICE');
  test.status = 'WAITING_FOR_DEVICE';
  await test.save();

  logStage('WAITING_FOR_DEVICE', { testId });
  return test;
}

/**
 * Generates a simple status object for the React frontend's Test Progress UI.
 */
async function getTestProgress(testId, farmerId) {
  const test = await Test.findOne({ testId, farmerId })
    .select('testId status startedAt');

  if (!test) throw new ApiError('Test not found', 404, 'TEST_NOT_FOUND');

  const progressMap = {
    'CREATED': 5,
    'OBSERVATION_PENDING': 10,
    'OBSERVATION_COMPLETED': 25,
    'WAITING_FOR_DEVICE': 35,
    'SENDING_TO_ML': 75,
    'CALCULATING_RISK': 90,
    'COMPLETED': 100,
    'FAILED': 0,
    'CANCELLED': 0
  };

  return {
    testId: test.testId,
    status: test.status,
    progress: progressMap[test.status] || 0
  };
}

module.exports = {
  startTest,
  submitObservations,
  readyForDevice,
  getTestProgress 
};