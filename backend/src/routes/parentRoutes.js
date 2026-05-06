const express = require('express');
const { getChildData, getPerformance, getChildren, getClassTeacher } = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Parent'));

router.get('/child-data', getChildData);
router.get('/children', getChildren);
router.get('/performance', getPerformance);
router.get('/class-teacher', getClassTeacher);

module.exports = router;
