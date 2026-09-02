/**
 * Dynamically generates recommended next actions based on the specific
 * factors that caused the high risk score.
 */
function generateRecommendations(riskLevel, factors, observationFlags) {
  const actions = [];

  // Base actions based on overall risk
  if (riskLevel === 'VERY_HIGH') {
    actions.push({
      priority: 'CRITICAL',
      title: 'Contact Veterinarian',
      description: 'Schedule a clinical evaluation for this cow immediately.',
      reason: 'Overall risk score is Very High.'
    });
    actions.push({
      priority: 'HIGH',
      title: 'Isolate Milk',
      description: 'Divert milk from the bulk tank until clinical assessment is complete.',
      reason: 'Prevent potential bulk tank contamination.'
    });
  } else if (riskLevel === 'HIGH') {
    actions.push({
      priority: 'HIGH',
      title: 'Monitor Udder Closely',
      description: 'Check for further swelling or heat in the next 12 hours.',
      reason: 'Elevated risk profile detected.'
    });
    actions.push({
      priority: 'MEDIUM',
      title: 'Schedule Follow-up Assessment',
      description: 'Repeat the SOMATIC milk test in 24 hours to check for trend changes.',
      reason: 'Verify if conditions are worsening.'
    });
  } else if (riskLevel === 'MEDIUM') {
    actions.push({
      priority: 'MEDIUM',
      title: 'Routine Monitoring',
      description: 'Keep an eye on milk appearance during the next milking session.',
      reason: 'Moderate risk indicators present.'
    });
  } else {
    actions.push({
      priority: 'LOW',
      title: 'Standard Protocol',
      description: 'Continue standard milking and hygiene protocols.',
      reason: 'Normal risk profile.'
    });
  }

  // Specific factor-based actions
  const hasHighConductivity = factors.some(f => f.parameter === 'conductivity' && f.status === 'ELEVATED');
  if (hasHighConductivity && riskLevel !== 'LOW') {
    actions.push({
      priority: 'MEDIUM',
      title: 'Review Milking Machine Vacuum',
      description: 'High conductivity can indicate tissue damage. Ensure milking cluster vacuum levels are normal.',
      reason: 'Elevated electrical conductivity detected.'
    });
  }

  if (observationFlags > 0) {
    actions.push({
      priority: 'MEDIUM',
      title: 'Physical Udder Check',
      description: 'Perform a manual palpation of the udder quarters.',
      reason: `${observationFlags} abnormal physical observation(s) recorded.`
    });
  }

  return actions;
}

module.exports = { generateRecommendations };