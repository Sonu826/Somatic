const config = require('../../config/riskConfig');

/**
 * Converts raw physical sensor measurements into a normalized 0-100 risk score.
 */
function scoreSensors(sensorData) {
  const { ph, temperature, conductivity } = sensorData;
  const th = config.sensorThresholds;
  
  let phScore = 0;
  let tempScore = 0;
  let condScore = 0;
  const factors = [];

  // pH Logic (Abnormal pH indicates mastitis)
  if (ph < th.ph.minNormal || ph > th.ph.maxNormal) {
    const diff = Math.min(
      Math.abs(ph < th.ph.minNormal ? th.ph.minNormal - ph : ph - th.ph.maxNormal),
      th.ph.extremeDiff
    );
    phScore = (diff / th.ph.extremeDiff) * 100;
    factors.push({ parameter: 'ph', value: ph, status: 'ELEVATED' });
  } else {
    factors.push({ parameter: 'ph', value: ph, status: 'NORMAL' });
  }

  // Temp Logic (Fever)
  const tempDiff = Math.abs(temperature - th.temperature.normal);
  if (tempDiff > 0.5) {
    tempScore = (Math.min(tempDiff, th.temperature.extremeDiff) / th.temperature.extremeDiff) * 100;
    factors.push({ parameter: 'temperature', value: temperature, status: 'ELEVATED' });
  } else {
    factors.push({ parameter: 'temperature', value: temperature, status: 'NORMAL' });
  }

  // Conductivity Logic (Higher salt content due to tissue damage)
  if (conductivity > th.conductivity.normal) {
    const condDiff = Math.min(conductivity - th.conductivity.normal, th.conductivity.extremeDiff);
    condScore = (condDiff / th.conductivity.extremeDiff) * 100;
    factors.push({ parameter: 'conductivity', value: conductivity, status: 'ELEVATED' });
  } else {
    factors.push({ parameter: 'conductivity', value: conductivity, status: 'NORMAL' });
  }

  // Average the three normalized scores
  const finalScore = Math.round((phScore + tempScore + condScore) / 3);

  return {
    score: finalScore,
    factors
  };
}

module.exports = { scoreSensors };