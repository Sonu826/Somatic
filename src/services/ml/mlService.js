const axios = require('axios');
const env = require('../../config/env');
const { adaptMlResponse } = require('./mlAdapter');
const { logger, logStage } = require('../../utils/logger');

/**
 * Communicates with the external Machine Learning API.
 */
async function getMastitisPrediction(testId, cowId, sensorData, observations) {
  logStage('ML_REQUEST_SENT', { testId, cowId });

  // Format the payload exactly how the Data Science team expects it
  const payload = {
    test_id: testId,
    cow_id: cowId.toString(),
    features: {
      ph: sensorData.ph,
      temperature: sensorData.temperature,
      conductivity: sensorData.conductivity,
      observation_flags: observations.positiveFlags
    }
  };

  // ==========================================
  // MOCK MODE: For local development when the Python ML API is offline
  // ==========================================
  if (env.MOCK_ML) {
    logger.debug('Mocking ML API response', { testId });
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate a fake but deterministic prediction based on conductivity
    const isHighRisk = sensorData.conductivity > 5.5 || observations.positiveFlags >= 2;
    
    const mockRawResponse = {
      prediction: isHighRisk ? 'mastitis_risk' : 'healthy',
      probability: isHighRisk ? 0.85 : 0.12,
      confidence: 0.91,
      modelVersion: 'mock-v1'
    };

    return adaptMlResponse(mockRawResponse);
  }

  // ==========================================
  // PRODUCTION MODE: Actual Axios call
  // ==========================================
  try {
    const response = await axios.post(env.ML_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.ML_API_KEY}` // If required
      },
      timeout: env.ML_TIMEOUT_MS // Fail fast (e.g. 8 seconds) rather than hanging
    });

    logStage('ML_RESPONSE_RECEIVED', { testId });
    return adaptMlResponse(response.data);

  } catch (error) {
    logger.error('ML API Request Failed', { 
      testId, 
      message: error.message, 
      code: error.code 
    });
    
    // We throw a standard Error (not an ApiError) because this happens asynchronously
    // in the background, not directly tied to a user HTTP request.
    throw new Error(`ML Service Failed: ${error.message}`);
  }
}

module.exports = { getMastitisPrediction };