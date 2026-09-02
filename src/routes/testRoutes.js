const express = require('express');
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { startTestSchema, submitObservationsSchema } = require('../validators/testValidator');

const router = express.Router();

router.use(authMiddleware);

router.post('/start', validate(startTestSchema), testController.startTest);
router.get('/:testId/status', testController.getTestStatus);
router.post('/:testId/observations', validate(submitObservationsSchema), testController.submitObservations);
router.post('/:testId/start-sensor', testController.startSensorTest);
router.get('/:testId/result', testController.getTestResult);


module.exports = router;