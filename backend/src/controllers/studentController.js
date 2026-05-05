const Homework = require('../models/Homework');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const LeaveRequest = require('../models/LeaveRequest');
const Student = require('../models/Student');

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private (Student)
exports.getDashboard = async (req, res, next) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user.id });
    const studentClass = studentProfile?.class || req.user.className;
    const homeworkQuery = studentClass ? { class: studentClass } : {};
    const homework = await Homework.find(homeworkQuery).sort({ dueDate: 1 }).limit(10);
    const marks = await Mark.find({ student: req.user.id }).sort('-date').limit(5);
    const attendance = await Attendance.find({ student: req.user.id }).sort('-date');
    const notifications = await Notification.find({ 
      $or: [{ recipient: req.user.id }, { role: 'Student' }, { role: 'All' }] 
    }).sort('-createdAt').limit(5);

    res.status(200).json({
      success: true,
      data: {
        homework,
        marks,
        attendance,
        notifications
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student timetable
// @route   GET /api/student/timetable
// @access  Private (Student)
exports.getTimetable = async (req, res, next) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user.id });
    const studentClass = studentProfile?.class || req.user.className;
    const timetable = await Timetable.find(studentClass ? { class: studentClass } : {});
    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student marks
// @route   GET /api/student/marks
// @access  Private (Student)
exports.getMarks = async (req, res, next) => {
  try {
    const marks = await Mark.find({ student: req.user.id }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: marks.length,
      data: marks,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student attendance
// @route   GET /api/student/attendance
// @access  Private (Student)
exports.getAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ student: req.user.id }).sort({ date: -1 });
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'Present').length;
    const absent = attendance.filter((a) => a.status === 'Absent').length;
    const late = attendance.filter((a) => a.status === 'Late').length;
    const excused = attendance.filter((a) => a.status === 'Excused').length;

    res.status(200).json({
      success: true,
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        rate: total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0,
      },
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit leave request
// @route   POST /api/student/leave
// @access  Private (Student)
exports.submitLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.create({
      ...req.body,
      user: req.user.id,
      role: 'Student'
    });

    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (err) {
    next(err);
  }
};
