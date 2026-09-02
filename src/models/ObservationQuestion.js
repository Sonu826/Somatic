const mongoose = require('mongoose');

const observationQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // For the prototype, an answer of "YES" means the risk flag is triggered.
    // This value represents the standardized penalty added to the observation score.
    riskScoreFlag: {
      type: Number,
      default: 25, 
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ObservationQuestion', observationQuestionSchema);