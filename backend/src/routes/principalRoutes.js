const express = require('express');
const { getAnalytics, updateLeaveStatus, getReportOverview } = require('../controllers/principalController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Principal'));

router.get('/analytics', getAnalytics);
router.get('/reports/overview', getReportOverview);
router.put('/leave/:id', updateLeaveStatus);

module.exports = router;
