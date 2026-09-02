/**
 * Global Configuration for the Risk Engine.
 * This is isolated here so clinical researchers can easily tune the algorithm
 * without digging through Express controllers.
 */
module.exports = {
  version: 'v1.0.0', // Saved with every test to ensure historical traceability

  // How much each phase contributes to the final out-of-100 score
  weights: {
    observation: 0.20, // 20%
    cmt: 0.30,         // 30% (CMT is highly diagnostic)
    sensor: 0.30,      // 30%
    ml: 0.20           // 20%
  },

  // Normalization boundaries for raw sensor values to 0-100 scales
  sensorThresholds: {
    ph: { minNormal: 6.4, maxNormal: 6.8, extremeDiff: 1.0 },
    temperature: { normal: 38.5, extremeDiff: 2.0 },
    conductivity: { normal: 4.5, extremeDiff: 2.5 }
  },

  // Final out-of-100 score required to trigger specific labels
  riskLabels: {
    LOW: { min: 0, max: 24 },
    MEDIUM: { min: 25, max: 49 },
    HIGH: { min: 50, max: 74 },
    VERY_HIGH: { min: 75, max: 100 }
  }
};