const mongoose = require('mongoose');
const { RISK_LEVELS } = require('../constants/riskLevels');

const cowSchema = new mongoose.Schema(
  {
    // Owning farmer. Every query in the app must be scoped by this field —
    // never trust a farmerId supplied by the frontend.
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Farmer-facing tag/identifier (e.g. "COW-024"), distinct from Mongo's _id.
    // Unique per farmer, not globally — two different farmers can each have
    // their own "COW-001".
    cowId: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    lactationNumber: {
      type: Number,
      min: 0,
    },
    lactationCycle: {
      type: Number,
      min: 0,
    },
    penNumber: {
      type: String,
      trim: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },

    // Denormalized "latest known" risk snapshot for fast dashboard/list
    // rendering, kept in sync whenever a Test completes (Phase 9+).
    // The full history always lives on Test documents — this is a cache,
    // not the source of truth.
    currentRiskLevel: {
      type: String,
      enum: RISK_LEVELS,
      default: null,
    },
    currentRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    lastTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      default: null,
    },
    lastTestDate: {
      type: Date,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// A given farmer cannot register the same cowId twice; different farmers can
// reuse the same tag independently.
cowSchema.index({ farmerId: 1, cowId: 1 }, { unique: true });
cowSchema.index({ farmerId: 1, active: 1 });
cowSchema.index({ farmerId: 1, currentRiskLevel: 1 });

module.exports = mongoose.model('Cow', cowSchema);
