const express = require('express');
const cowController = require('../controllers/cowController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { createCowSchema, updateCowSchema, listCowsQuerySchema } = require('../validators/cowValidator');

const router = express.Router();

// Every cow route requires authentication.
router.use(authMiddleware);

router.get('/', validate(listCowsQuerySchema, 'query'), cowController.getCows);
router.post('/', validate(createCowSchema), cowController.createCow);
router.get('/:id', cowController.getCowById);
router.put('/:id', validate(updateCowSchema), cowController.updateCow);
router.delete('/:id', cowController.deleteCow);

module.exports = router;
