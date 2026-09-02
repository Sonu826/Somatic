const Test = require('../models/Test');
const Cow = require('../models/Cow');
const mlService = require('./ml/mlService');
const riskEngine = require('./risk/riskEngine');
const riskConfig = require('../config/riskConfig');
const alertService = require('./alert/alertService');

async function runTestPipeline(testId, farmerId) {
  try {
    const test = await Test.findOne({ testId, farmerId });
    if (!test) return;

    // --- 1. CALL ML API ---
    test.status = 'SENDING_TO_ML';
    await test.save();

    const mlResult = await mlService.getMastitisPrediction(
      test.testId,
      test.cowId,
      test.sensorData,
      test.observations
    );

    test.mlResult = mlResult;
    test.modelVersion = mlResult.modelVersion;
    
    // --- 2. CALCULATE FINAL RISK ---
    test.status = 'CALCULATING_RISK';
    await test.save();

    const riskProfile = riskEngine.calculateFinalRisk(test);

    // Save final results
    test.riskResult = {
      score: riskProfile.score,
      level: riskProfile.level,
      trend: 'STABLE'
    };
    
    // Save the exact version of the weights used
    test.riskConfigVersion = riskConfig.version || 'v1'; 
    
    // Set to COMPLETED
    test.status = 'COMPLETED';
    test.completedAt = Date.now();
    await test.save();

    // --- 3. GENERATE ALERTS ---
    await alertService.createRiskAlert(
      farmerId, 
      test.cowId, 
      test.testId, 
      riskProfile.level, 
      test.cowId 
    );

    // --- 4. UPDATE COW PROFILE CACHE ---
    await Cow.findByIdAndUpdate(test.cowId, {
      currentRiskLevel: riskProfile.level,
      currentRiskScore: riskProfile.score,
      lastTestId: test._id,
      lastTestDate: test.completedAt
    });

  } catch (error) {
    console.error('Pipeline failed:', { testId, error: error.message });
    await Test.updateOne(
        { testId, farmerId }, 
        { status: 'FAILED', error: error.message }
    );
  }
}

module.exports = { runTestPipeline };