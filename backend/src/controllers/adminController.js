const User = require('../models/User');
const Fee = require('../models/Fee');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const Attendance = require('../models/Attendance');
const ClassModel = require('../models/Class');
const Subject = require('../models/Subject');
const TeacherAllocation = require('../models/TeacherAllocation');

// @desc    Get all notifications
// @route   GET /api/admin/notifications
// @access  Private (Admin)
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a notification
// @route   POST /api/admin/notifications
// @access  Private (Admin)
exports.createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get timetable by class
// @route   GET /api/admin/timetable/:className
// @access  Private (Admin, Teacher, Student)
exports.getTimetable = async (req, res, next) => {
  try {
    const timetable = await Timetable.find({ class: req.params.className }).populate('periods.teacher', 'name');
    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upsert timetable for a class and day
// @route   POST /api/admin/timetable
// @access  Private (Admin)
exports.upsertTimetable = async (req, res, next) => {
  try {
    const { className, day, periods } = req.body;

    const timetable = await Timetable.findOneAndUpdate(
      { class: className, day },
      { periods },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all fees
// @route   GET /api/admin/fees
// @access  Private (Admin)
exports.getFees = async (req, res, next) => {
  try {
    const fees = await Fee.find().populate('student', 'name email');
    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a fee record
// @route   POST /api/admin/fees
// @access  Private (Admin)
exports.createFee = async (req, res, next) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json({
      success: true,
      data: fee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update fee status
// @route   PUT /api/admin/fees/:id
// @access  Private (Admin)
exports.updateFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee record not found' });
    }

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users by role
// @route   GET /api/admin/users/:role
// @access  Private (Admin)
exports.getUsersByRole = async (req, res, next) => {
  try {
    const users = await User.find({ role: req.params.role });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (optional role filter)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new user (Student, Teacher, etc.)
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.password) {
      return res.status(400).json({ success: false, error: 'Password is required for new users' });
    }
    const user = await User.create(payload);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk create users
// @route   POST /api/admin/users/bulk
// @access  Private (Admin)
exports.bulkCreateUsers = async (req, res, next) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) {
      return res.status(400).json({ success: false, error: 'Users must be an array' });
    }

    const createdUsers = await User.insertMany(users.map(u => ({
      ...u,
      isApproved: true
    })));

    res.status(201).json({
      success: true,
      data: createdUsers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const payload = { ...req.body };
    if (!payload.password) {
      delete payload.password;
    }

    if (payload.password) {
      user.password = payload.password;
      user.name = payload.name || user.name;
      user.email = payload.email || user.email;
      user.role = payload.role || user.role;
      await user.save();
    } else {
      user = await User.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user approval status
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin)
exports.toggleUserApproval = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isApproved = !user.isApproved;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get students
// @route   GET /api/admin/students
// @access  Private (Admin)
exports.getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'Student' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get teachers
// @route   GET /api/admin/teachers
// @access  Private (Admin)
exports.getTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'Teacher' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create student
// @route   POST /api/admin/students
// @access  Private (Admin)
exports.createStudent = async (req, res, next) => {
  try {
    const payload = { ...req.body, role: 'Student' };
    if (!payload.password) {
      return res.status(400).json({ success: false, error: 'Password is required for new student' });
    }
    const student = await User.create(payload);
    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create teacher
// @route   POST /api/admin/teachers
// @access  Private (Admin)
exports.createTeacher = async (req, res, next) => {
  try {
    const payload = { ...req.body, role: 'Teacher' };
    if (!payload.password) {
      return res.status(400).json({ success: false, error: 'Password is required for new teacher' });
    }
    const teacher = await User.create(payload);
    res.status(201).json({
      success: true,
      data: teacher,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Attendance mock endpoint
// @route   GET /api/admin/mock/attendance
// @access  Private (Admin)
exports.getMockAttendance = async (req, res, next) => {
  try {
    const mockData = [
      { studentName: 'John Doe', class: 'Grade 10-A', status: 'Present', date: new Date().toISOString() },
      { studentName: 'Jane Smith', class: 'Grade 10-A', status: 'Absent', date: new Date().toISOString() },
      { studentName: 'Rahul Verma', class: 'Grade 11-B', status: 'Late', date: new Date().toISOString() },
    ];
    res.status(200).json({
      success: true,
      count: mockData.length,
      data: mockData,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Marks mock endpoint
// @route   GET /api/admin/mock/marks
// @access  Private (Admin)
exports.getMockMarks = async (req, res, next) => {
  try {
    const mockData = [
      { studentName: 'John Doe', subject: 'Math', examName: 'Midterm', score: 82, totalMarks: 100 },
      { studentName: 'Jane Smith', subject: 'Science', examName: 'Midterm', score: 90, totalMarks: 100 },
      { studentName: 'Rahul Verma', subject: 'English', examName: 'Unit Test', score: 76, totalMarks: 100 },
    ];
    res.status(200).json({
      success: true,
      count: mockData.length,
      data: mockData,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalTeachers = await User.countDocuments({ role: 'Teacher' });
    const totalParents = await User.countDocuments({ role: 'Parent' });
    const totalClasses = await ClassModel.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const paidFees = await Fee.countDocuments({ status: 'Paid' });
    const unpaidFees = await Fee.countDocuments({ status: { $ne: 'Paid' } });

    const totalAttendance = await Attendance.countDocuments();
    const presentAttendance = await Attendance.countDocuments({ status: 'Present' });
    const attendanceRate =
      totalAttendance > 0 ? ((presentAttendance / totalAttendance) * 100).toFixed(2) : '0.00';

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalClasses,
        totalSubjects,
        feeCollection: {
          paidFees,
          unpaidFees,
        },
        attendanceRate,
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Advanced Dashboard Stats (Charts)
// @route   GET /api/admin/advanced-stats
// @access  Private (Admin)
exports.getAdvancedStats = async (req, res, next) => {
  try {
    // Fee trends (Last 6 months)
    const feeTrends = await Fee.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id': 1 } },
      { $limit: 6 }
    ]);

    // Enrollment trends
    const enrollmentTrends = await User.aggregate([
      { $match: { role: 'Student' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        feeTrends,
        enrollmentTrends,
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all classes with subject details
// @route   GET /api/admin/classes
// @access  Private (Admin)
exports.getClasses = async (req, res, next) => {
  try {
    const classes = await ClassModel.find()
      .populate('subjects', 'name code')
      .populate('classTeacher', 'name email');

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create class
// @route   POST /api/admin/classes
// @access  Private (Admin)
exports.createClass = async (req, res, next) => {
  try {
    const newClass = await ClassModel.create(req.body);
    res.status(201).json({
      success: true,
      data: newClass,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update class
// @route   PUT /api/admin/classes/:id
// @access  Private (Admin)
exports.updateClass = async (req, res, next) => {
  try {
    const updatedClass = await ClassModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedClass) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete class
// @route   DELETE /api/admin/classes/:id
// @access  Private (Admin)
exports.deleteClass = async (req, res, next) => {
  try {
    const classDoc = await ClassModel.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    await classDoc.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private (Admin)
exports.getSubjects = async (req, res, next) => {
  try {
    const defaults = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Science', code: 'SCI' },
      { name: 'English', code: 'ENG' },
      { name: 'Social Studies', code: 'SST' },
      { name: 'Computer Science', code: 'CS' },
    ];
    const existingCount = await Subject.countDocuments();
    if (existingCount === 0) {
      await Subject.insertMany(defaults);
    }
    const subjects = await Subject.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create subject
// @route   POST /api/admin/subjects
// @access  Private (Admin)
exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update subject
// @route   PUT /api/admin/subjects/:id
// @access  Private (Admin)
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete subject
// @route   DELETE /api/admin/subjects/:id
// @access  Private (Admin)
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    await ClassModel.updateMany({}, { $pull: { subjects: subject._id } });
    await subject.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get teacher allocations
// @route   GET /api/admin/allocations
// @access  Private (Admin)
exports.getTeacherAllocations = async (req, res, next) => {
  try {
    const allocations = await TeacherAllocation.find()
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: allocations.length,
      data: allocations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create teacher allocation
// @route   POST /api/admin/allocations
// @access  Private (Admin)
exports.createTeacherAllocation = async (req, res, next) => {
  try {
    const allocation = await TeacherAllocation.create(req.body);
    res.status(201).json({
      success: true,
      data: allocation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete teacher allocation
// @route   DELETE /api/admin/allocations/:id
// @access  Private (Admin)
exports.deleteTeacherAllocation = async (req, res, next) => {
  try {
    const allocation = await TeacherAllocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, error: 'Allocation not found' });
    }
    await allocation.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin report overview
// @route   GET /api/admin/reports/overview
// @access  Private (Admin)
exports.getAdminReportOverview = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalTeachers = await User.countDocuments({ role: 'Teacher' });
    const totalClasses = await ClassModel.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalFees = await Fee.countDocuments();
    const paidFees = await Fee.countDocuments({ status: 'Paid' });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalFees,
        paidFees,
      },
    });
  } catch (err) {
    next(err);
  }
};
