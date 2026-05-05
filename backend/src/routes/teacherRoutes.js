const express = require('express');
const { 
  createHomework, 
  getTeacherHomework, 
  updateMarks,
  getStudents,
  markAttendance,
  getTeacherDashboard,
  getTeacherClasses,
  upsertTeacherTimetable,
  getTeacherTimetable,
  bulkUpdateMarks
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields, validateAttendanceStatus } = require('../middleware/validate');

const router = express.Router();

// All routes here are protected and restricted to Teachers
router.use(protect);
router.use(authorize('Teacher'));

router.route('/homework')
  .post(requireFields(['title', 'subject', 'class', 'dueDate']), createHomework)
  .get(getTeacherHomework);

router.post('/marks', requireFields(['studentId', 'subject', 'examName', 'score']), updateMarks);
router.post('/marks/bulk', requireFields(['marks', 'subject', 'examName']), bulkUpdateMarks);
router.get('/students', getStudents);
router.post('/attendance', requireFields(['studentId', 'status', 'className']), validateAttendanceStatus, markAttendance);
router.get('/dashboard', getTeacherDashboard);
router.get('/classes', getTeacherClasses);
router.route('/timetable')
  .get(getTeacherTimetable)
  .post(requireFields(['className', 'day', 'periods']), upsertTeacherTimetable);

module.exports = router;
