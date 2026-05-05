const express = require('express');
const { getDashboard, getTimetable, submitLeave, getMarks, getAttendance } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Student'));

router.get('/dashboard', getDashboard);
router.get('/timetable', getTimetable);
router.get('/marks', getMarks);
router.get('/attendance', getAttendance);
router.post('/leave', submitLeave);

module.exports = router;
