const riskConfig = require('../../config/riskConfig');
const { scoreSensors } = require('./sensorScoring');
const { logStage, logger } = require('../../utils/logger');

/**
 * The core weighted scoring engine.
 * Takes the raw test document containing observations, ML output, etc.,
 * and generates a highly transparent, out-of-100 risk profile.
 */
function calculateFinalRisk(test) {
  logStage('RISK_CALCULATION_STARTED', { testId: test.testId });

  // 1. Observation Score (Max 100)
  // Observation flags are stored as standard penalties (e.g. 25 points each). 
  // We cap it at 100.
  let obsRawScore = 0;
  if (test.observations && test.observations.answers) {
    obsRawScore = test.observations.answers.reduce((sum, ans) => sum + ans.score, 0);
  }
  const observationScore = Math.min(obsRawScore, 100);

  // 2. Sensor Score
  const sensorResult = scoreSensors(test.sensorData);
  const sensorScore = sensorResult.score;

  // 3. ML Score (Probability 0.0 to 1.0 -> 0 to 100)
  const mlScore = test.mlResult?.probability ? Math.round(test.mlResult.probability * 100) : 0;

  // 4. CMT Score (CMT is not yet implemented, defaults to 0)
  const cmtScore = test.cmtData?.score || 0;

  // Apply Configurable Weights
  const weights = riskConfig.weights;
  
  const compObs = observationScore * weights.observation;
  const compSensor = sensorScore * weights.sensor;
  const compMl = mlScore * weights.ml;
  const compCmt = cmtScore * weights.cmt;

  const finalScore = Math.round(compObs + compSensor + compMl + compCmt);

  // Determine String Label
  let riskLevel = 'UNKNOWN';
  const labels = riskConfig.riskLabels;
  if (finalScore <= labels.LOW.max) riskLevel = 'LOW';
  else if (finalScore <= labels.MEDIUM.max) riskLevel = 'MEDIUM';
  else if (finalScore <= labels.HIGH.max) riskLevel = 'HIGH';
  else riskLevel = 'VERY_HIGH';

  logStage('RISK_CALCULATION_COMPLETED', { testId: test.testId, finalScore, riskLevel });

  // Provide extreme transparency so the frontend can explain the result
  return {
    score: finalScore,
    percentage: finalScore,
    level: riskLevel,
    trend: "STABLE", // Default placeholder for Phase 10
    components: {
      observation: { score: observationScore, weight: weights.observation, contribution: compObs },
      sensor: { score: sensorScore, weight: weights.sensor, contribution: compSensor },
      ml: { score: mlScore, weight: weights.ml, contribution: compMl },
      cmt: { score: cmtScore, weight: weights.cmt, contribution: compCmt }
    },
    sensorFactors: sensorResult.factors
  };
}

module.exports = { calculateFinalRisk };