/**
 * Canonical test statuses representing the state machine of a milk test.
 * Used strictly by testService to validate transitions.
 */
const TEST_STATUSES = [
  'CREATED',
  'OBSERVATION_PENDING',
  'OBSERVATION_COMPLETED',
  'WAITING_FOR_DEVICE',
  'DEVICE_CONNECTED',
  'READING_SENSORS',
  'SENDING_TO_ML',
  'CALCULATING_RISK',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
];

module.exports = { TEST_STATUSES };