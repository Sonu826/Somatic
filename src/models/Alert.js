const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      default: null,
    },
    testId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['RISK_ESCALATION', 'SYSTEM_ERROR', 'DEVICE_OFFLINE'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'HIGH', 'CRITICAL'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);