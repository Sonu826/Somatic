/**
 * Canonical risk level values. Referenced by the Cow model (currentRiskLevel),
 * the future Test/riskResult model, and the risk engine's classifier.
 * Defined once here so nothing drifts out of sync.
 */
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

module.exports = { RISK_LEVELS };
