const iotService = require('../services/iot/iotService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const receiveSensorData = asyncHandler(async (req, res) => {
  // Pass the validated body to the service
  const result = await iotService.processFinalSensorData(req.user.userId, req.body);
  
  return sendSuccess(res, { 
    message: 'Final telemetry received', 
    status: result.status 
  }, result.status === 'SAVED' ? 201 : 200);
});

module.exports = { receiveSensorData };