const SensorReading = require('../../models/SensorReading');
const Test = require('../../models/Test');
const pipelineService = require('../pipelineService'); // <--- NEW IMPORT
const { ApiError } = require('../../utils/apiResponse');
const { logStage, logger } = require('../../utils/logger');

/**
 * Processes the final IoT sensor payload for a test session.
 */
async function processFinalSensorData(farmerId, payload) {
  const { testId, cowId, deviceId, timestamp, measurements } = payload;

  const test = await Test.findOne({ testId, farmerId });
  if (!test) {
    throw new ApiError('Test not found', 404, 'TEST_NOT_FOUND');
  }

  if (test.cowId.toString() !== cowId) {
    throw new ApiError('Cow ID mismatch for this test session', 400, 'COW_MISMATCH');
  }

  // If the test has already passed the sensor phase, return success safely (Idempotency)
  if (['SENDING_TO_ML', 'CALCULATING_RISK', 'COMPLETED'].includes(test.status)) {
    logger.debug('Duplicate final sensor payload ignored', { testId });
    return { status: 'ALREADY_PROCESSED' };
  }

  const validStates = ['WAITING_FOR_DEVICE', 'DEVICE_CONNECTED', 'READING_SENSORS'];
  if (!validStates.includes(test.status)) {
    throw new ApiError(`Cannot accept sensor data. Test is in state: ${test.status}`, 400, 'INVALID_STATE');
  }

  // 1. Create the immutable sensor record
  const reading = await SensorReading.create({
    testId,
    cowId,
    deviceId,
    timestamp,
    ph: measurements.ph,
    temperature: measurements.temperature,
    conductivity: measurements.conductivity,
    rawPayload: payload 
  });

  // 2. Lock in the final sensor data to the Test document
  test.sensorData = {
    ph: measurements.ph,
    temperature: measurements.temperature,
    conductivity: measurements.conductivity,
  };
  
  // 3. Advance state machine to ML phase
  test.deviceId = deviceId;
  test.status = 'SENDING_TO_ML';
  await test.save();

  logStage('SENSOR_DATA_RECEIVED', { testId, deviceId });

  // 4. TRIGGER THE ML AND RISK PIPELINE IN THE BACKGROUND
  // We don't use 'await' here because we want to immediately return 201 Success to the IoT device
  pipelineService.runTestPipeline(testId, farmerId).catch(err => {
    logger.error('Unhandled pipeline background error', { error: err.message });
  });
  
  return { status: 'SAVED', reading };
}

module.exports = {
  processFinalSensorData
};