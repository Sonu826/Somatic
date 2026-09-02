/**
 * Adapts raw responses from the external ML API into a standardized format.
 * If the data science team changes the Python API response structure later, 
 * you only need to update this one file.
 */
function adaptMlResponse(rawResponse) {
  // Fallback defaults in case the ML service returns partial data
  return {
    probability: typeof rawResponse.probability === 'number' ? rawResponse.probability : 0,
    confidence: typeof rawResponse.confidence === 'number' ? rawResponse.confidence : 0,
    prediction: rawResponse.prediction || 'UNKNOWN',
    modelVersion: rawResponse.modelVersion || 'v1-default',
    processedFeatures: rawResponse.processedFeatures || {},
  };
}

module.exports = { adaptMlResponse };