const testService = require('../services/testService');
const Test = require('../models/Test');
const riskEngine = require('../services/risk/riskEngine');
const { scoreSensors } = require('../services/risk/sensorScoring');
const { generateRecommendations } = require('../services/risk/recommendationEngine');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const startTest = asyncHandler(async (req, res) => {
  const { cowId } = req.body;
  const test = await testService.startTest(req.user.userId, cowId);
  return sendSuccess(res, { test }, 201);
});

const getTestStatus = asyncHandler(async (req, res) => {
  const statusData = await testService.getTestProgress(req.params.testId, req.user.userId);
  return sendSuccess(res, statusData);
});

const submitObservations = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const test = await testService.submitObservations(req.params.testId, req.user.userId, answers);
  return sendSuccess(res, { test });
});

const startSensorTest = asyncHandler(async (req, res) => {
  const test = await testService.readyForDevice(req.params.testId, req.user.userId);
  return sendSuccess(res, { test });
});

const getTestResult = asyncHandler(async (req, res) => {
  // Fetch test and populate the Cow details
  const test = await Test.findOne({ testId: req.params.testId, farmerId: req.user.userId })
    .populate('cowId', 'name cowId breed age penNumber');

  if (!test) throw new ApiError('Test not found', 404, 'TEST_NOT_FOUND');
  if (test.status !== 'COMPLETED') {
    throw new ApiError('Test is not yet completed', 400, 'TEST_INCOMPLETE');
  }

  // Recalculate component breakdown dynamically for extreme transparency
  const riskProfile = riskEngine.calculateFinalRisk(test);
  const sensorFactors = scoreSensors(test.sensorData).factors;
  
  // Create an array of text explanations (Contributing Factors)
  const contributingFactors = [];
  if (test.observations.positiveFlags > 0) {
    contributingFactors.push(`${test.observations.positiveFlags} abnormal physical observation(s) flagged`);
  }
  sensorFactors.forEach(f => {
    if (f.status === 'ELEVATED') contributingFactors.push(`Elevated ${f.parameter} (${f.value})`);
  });
  if (test.mlResult && test.mlResult.probability > 0.6) {
    contributingFactors.push(`AI Model detected high probability patterns (${Math.round(test.mlResult.probability * 100)}%)`);
  }

  // Generate required actions
  const recommendedActions = generateRecommendations(
    test.riskResult.level, 
    sensorFactors, 
    test.observations.positiveFlags
  );

  // Return the master payload exactly as the frontend needs it
  return sendSuccess(res, {
    testId: test.testId,
    timestamp: test.completedAt,
    cow: test.cowId,
    
    risk: {
      score: test.riskResult.score,
      percentage: test.riskResult.score, 
      level: test.riskResult.level,
      trend: test.riskResult.trend,
    },
    
    observations: test.observations,
    
    sensors: {
      ph: sensorFactors.find(f => f.parameter === 'ph') || {},
      temperature: sensorFactors.find(f => f.parameter === 'temperature') || {},
      conductivity: sensorFactors.find(f => f.parameter === 'conductivity') || {},
    },
    
    cmt: test.cmtData,
    
    ml: {
      probability: test.mlResult.probability || 0,
      confidence: test.mlResult.confidence || 0,
      modelVersion: test.modelVersion,
    },
    
    riskComponents: riskProfile.components,
    contributingFactors,
    recommendedActions,
    disclaimer: "This system provides a risk assessment based on sensor data and machine learning. It does not replace a definitive veterinary diagnosis."
  });
});

module.exports = {
  startTest,
  getTestStatus,
  submitObservations,
  startSensorTest,
  getTestResult
};