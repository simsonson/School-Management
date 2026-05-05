const Homework = require('../models/Homework');
const Mark = require('../models/Mark');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const ClassModel = require('../models/Class');
const TeacherAllocation = require('../models/TeacherAllocation');

const getTeacherClassSet = async (teacherId) => {
  const allocations = await TeacherAllocation.find({ teacher: teacherId }).select('className');
  return new Set(allocations.map((a) => a.className));
};

// @desc    Mark attendance for a student
// @route   POST /api/teacher/attendance
// @access  Private (Teacher)
exports.markAttendance = async (req, res, next) => {
  try {
    const { studentId, status, date, className } = req.body;
    const allowedClasses = await getTeacherClassSet(req.user.id);
    if (allowedClasses.size > 0 && !allowedClasses.has(className)) {
      return res.status(403).json({ success: false, error: 'Not authorized for this class attendance' });
    }

    const student = await User.findById(studentId).select('className role');
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    if (student.className && student.className !== className) {
      return res.status(400).json({ success: false, error: 'Student class mismatch for selected class' });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { student: studentId, date: new Date(date || Date.now()).setHours(0,0,0,0) },
      { 
        status, 
        markedBy: req.user.id,
        class: className 
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create homework
// @route   POST /api/teacher/homework
// @access  Private (Teacher)
exports.createHomework = async (req, res, next) => {
  try {
    const allowedClasses = await getTeacherClassSet(req.user.id);
    if (allowedClasses.size > 0 && !allowedClasses.has(req.body.class)) {
      return res.status(403).json({ success: false, error: 'Not authorized to assign homework for this class' });
    }
    req.body.teacher = req.user.id;

    const homework = await Homework.create(req.body);

    res.status(201).json({
      success: true,
      data: homework,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all homework assigned by teacher
// @route   GET /api/teacher/homework
// @access  Private (Teacher)
exports.getTeacherHomework = async (req, res, next) => {
  try {
    const homework = await Homework.find({ teacher: req.user.id });

    res.status(200).json({
      success: true,
      count: homework.length,
      data: homework,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add or Update marks for a student
// @route   POST /api/teacher/marks
// @access  Private (Teacher)
exports.updateMarks = async (req, res, next) => {
  try {
    const { studentId, subject, examName, score, totalMarks } = req.body;

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    const allowedClasses = await getTeacherClassSet(req.user.id);
    if (allowedClasses.size > 0 && student.className && !allowedClasses.has(student.className)) {
      return res.status(403).json({ success: false, error: 'Not authorized to update marks for this student class' });
    }

    const mark = await Mark.create({
      student: studentId,
      subject,
      examName,
      score,
      totalMarks,
      teacher: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: mark,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk Add or Update marks for multiple students
// @route   POST /api/teacher/marks/bulk
// @access  Private (Teacher)
exports.bulkUpdateMarks = async (req, res, next) => {
  try {
    const { marks, subject, examName, totalMarks } = req.body;
    
    if (!Array.isArray(marks)) {
      return res.status(400).json({ success: false, error: 'Marks must be an array' });
    }

    const markOperations = marks.map((m) => ({
      student: m.studentId,
      subject,
      examName,
      score: m.score,
      totalMarks: totalMarks || 100,
      teacher: req.user.id,
      date: new Date()
    }));

    const result = await Mark.insertMany(markOperations);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all students (to select for marks)
// @route   GET /api/teacher/students
// @access  Private (Teacher)
exports.getStudents = async (req, res, next) => {
  try {
    const allowedClasses = await getTeacherClassSet(req.user.id);
    const query = { role: 'Student' };
    if (req.query.className) {
      query.className = req.query.className;
    } else if (allowedClasses.size > 0) {
      query.className = { $in: Array.from(allowedClasses) };
    }
    const students = await User.find(query);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Teacher dashboard snapshot
// @route   GET /api/teacher/dashboard
// @access  Private (Teacher)
exports.getTeacherDashboard = async (req, res, next) => {
  try {
    const homeworkCount = await Homework.countDocuments({ teacher: req.user.id });
    const studentCount = await User.countDocuments({ role: 'Student' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceMarkedToday = await Attendance.countDocuments({
      markedBy: req.user.id,
      date: { $gte: today },
    });

    const marksUploaded = await Mark.countDocuments({ teacher: req.user.id });
    const classesToday = await Timetable.find({ day: today.toLocaleDateString('en-US', { weekday: 'long' }) }).limit(5);
    const recentHomework = await Homework.find({ teacher: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        homeworkCount,
        studentCount,
        attendanceMarkedToday,
        marksUploaded,
        classesToday,
        recentHomework,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get classes for teacher homework/attendance
// @route   GET /api/teacher/classes
// @access  Private (Teacher)
exports.getTeacherClasses = async (req, res, next) => {
  try {
    const allowedClasses = await getTeacherClassSet(req.user.id);
    const classes = await ClassModel.find().select('name section').sort({ name: 1, section: 1 });
    const filtered = allowedClasses.size
      ? classes.filter((c) => allowedClasses.has(`${c.name}${c.section ? `-${c.section}` : ''}`))
      : classes;
    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered.map((c) => ({
        _id: c._id,
        value: `${c.name}${c.section ? `-${c.section}` : ''}`,
        name: c.name,
        section: c.section,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upsert timetable by class/day
// @route   POST /api/teacher/timetable
// @access  Private (Teacher)
exports.upsertTeacherTimetable = async (req, res, next) => {
  try {
    const { className, day, periods } = req.body;
    const seenSlots = new Set();
    for (const period of periods || []) {
      if (period.startTime >= period.endTime) {
        return res.status(400).json({ success: false, error: 'Period end time must be after start time' });
      }
      const key = `${period.startTime}-${period.endTime}`;
      if (seenSlots.has(key)) {
        return res.status(400).json({ success: false, error: 'Duplicate period time detected in same day' });
      }
      seenSlots.add(key);
    }

    const sorted = [...(periods || [])].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i].startTime < sorted[i - 1].endTime) {
        return res.status(400).json({ success: false, error: 'Timetable has overlapping period times' });
      }
    }

    const normalizedPeriods = (periods || []).map((period) => ({
      subject: period.subject,
      startTime: period.startTime,
      endTime: period.endTime,
      teacher: req.user.id,
    }));

    const timetable = await Timetable.findOneAndUpdate(
      { class: className, day },
      { class: className, day, periods: normalizedPeriods },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get timetable for a class
// @route   GET /api/teacher/timetable
// @access  Private (Teacher)
exports.getTeacherTimetable = async (req, res, next) => {
  try {
    const { className } = req.query;
    const filter = className ? { class: className } : {};
    const timetable = await Timetable.find(filter)
      .populate('periods.teacher', 'name')
      .sort({ day: 1 });

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable,
    });
  } catch (err) {
    next(err);
  }
};
