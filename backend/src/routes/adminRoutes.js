const express = require('express');
const { 
  getUsersByRole, 
  createUser, 
  updateUser, 
  deleteUser,
  getStats,
  getFees,
  createFee,
  updateFee,
  getTimetable,
  upsertTimetable,
  getNotifications,
  createNotification,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
  ,
  getAllUsers,
  getStudents,
  getTeachers,
  createStudent,
  createTeacher,
  getMockAttendance,
  getMockMarks,
  getTeacherAllocations,
  createTeacherAllocation,
  deleteTeacherAllocation,
  getAdminReportOverview
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields, validateRole } = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getStats);
router.get('/reports/overview', getAdminReportOverview);

router.route('/fees')
  .get(getFees)
  .post(requireFields(['student', 'amount', 'type', 'dueDate']), createFee);

router.put('/fees/:id', updateFee);

router.route('/timetable')
  .post(upsertTimetable);

router.get('/timetable/:className', getTimetable);

router.route('/notifications')
  .get(getNotifications)
  .post(createNotification);

router.route('/classes')
  .get(getClasses)
  .post(requireFields(['name']), createClass);

router.route('/classes/:id')
  .put(updateClass)
  .delete(deleteClass);

router.route('/subjects')
  .get(getSubjects)
  .post(requireFields(['name', 'code']), createSubject);

router.route('/subjects/:id')
  .put(updateSubject)
  .delete(deleteSubject);

router.route('/users')
  .get(getAllUsers)
  .post(
    requireFields(['name', 'email', 'password', 'role']),
    validateRole(['Admin', 'Teacher', 'Student', 'Parent', 'Principal']),
    createUser
  );

router.get('/users/:role', getUsersByRole);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

router.route('/students')
  .get(getStudents)
  .post(requireFields(['name', 'email', 'password']), createStudent);

router.route('/teachers')
  .get(getTeachers)
  .post(requireFields(['name', 'email', 'password']), createTeacher);

router.get('/mock/attendance', getMockAttendance);
router.get('/mock/marks', getMockMarks);

router.route('/allocations')
  .get(getTeacherAllocations)
  .post(requireFields(['teacher', 'className', 'subject']), createTeacherAllocation);

router.delete('/allocations/:id', deleteTeacherAllocation);

module.exports = router;
