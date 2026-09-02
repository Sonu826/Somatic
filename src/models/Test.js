const mongoose = require('mongoose');
const { TEST_STATUSES } = require('../constants/testStatuses');
const { RISK_LEVELS } = require('../constants/riskLevels');

const testSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
      unique: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: TEST_STATUSES,
      default: 'CREATED',
    },
    
    // Phase 5: Observation Storage
    observations: {
      total: { type: Number, default: 0 },
      positiveFlags: { type: Number, default: 0 },
      answers: [
        {
          questionId: String,
          question: String,
          answer: { type: String, enum: ['YES', 'NO'] },
          score: Number,
        }
      ]
    },

    // Phase 11: CMT Storage (Prepared for later)
    cmtData: {
      result: { type: String, enum: ['NEGATIVE', 'TRACE', 'WEAK_POSITIVE', 'POSITIVE', 'STRONG_POSITIVE'], default: null },
      score: { type: Number, default: 0 },
      somaticCellEstimate: { type: Number, default: null }
    },

    // Sensor, ML and Risk structures will be populated in subsequent phases.
    sensorData: { type: mongoose.Schema.Types.Mixed, default: {} },
    mlResult: { type: mongoose.Schema.Types.Mixed, default: {} },
    
    riskResult: {
      score: { type: Number, default: null },
      level: { type: String, enum: RISK_LEVELS, default: null },
      trend: { type: String, default: null },
    },

    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    
    error: { type: String, default: null },
    modelVersion: { type: String, default: null },
    riskConfigVersion: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);