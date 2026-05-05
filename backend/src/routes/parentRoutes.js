const express = require('express');
const { getChildData } = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Parent'));

router.get('/child-data', getChildData);

module.exports = router;
