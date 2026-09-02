const Alert = require('../../models/Alert');
const { logger } = require('../../utils/logger');

async function createRiskAlert(farmerId, cowId, testId, riskLevel, cowName) {
  if (riskLevel !== 'HIGH' && riskLevel !== 'VERY_HIGH') return; // Only alert for severe cases

  const severity = riskLevel === 'VERY_HIGH' ? 'CRITICAL' : 'HIGH';
  const title = `${riskLevel.replace('_', ' ')} Risk Detected`;
  const message = `Cow ${cowName || 'Unknown'} has been assessed with a ${riskLevel.replace('_', ' ')} risk of mastitis. Immediate review recommended.`;

  try {
    await Alert.create({
      userId: farmerId,
      cowId,
      testId,
      type: 'RISK_ESCALATION',
      severity,
      title,
      message
    });
  } catch (error) {
    logger.error('Failed to create risk alert', { testId, error: error.message });
  }
}

module.exports = { createRiskAlert };