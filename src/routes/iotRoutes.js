const express = require('express');
const iotController = require('../controllers/iotController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { sensorDataSchema } = require('../validators/iotValidator');

const router = express.Router();

// Assuming the frontend app (which has the Farmer's JWT) relays the Bluetooth IoT data
router.use(authMiddleware);

router.post(
  '/sensor-data', 
  validate(sensorDataSchema), 
  iotController.receiveSensorData
);

module.exports = router;