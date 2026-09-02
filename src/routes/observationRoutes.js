const express = require('express');
const observationController = require('../controllers/observationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/questions', observationController.getActiveQuestions);

module.exports = router;