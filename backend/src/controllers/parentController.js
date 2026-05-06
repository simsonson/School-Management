const User = require('../models/User');
const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const TeacherAllocation = require('../models/TeacherAllocation');

// @desc    Get child data (linked via parentEmail on the student User record OR parentId on Student profile)
// @route   GET /api/parent/child-data
// @access  Private (Parent)
exports.getChildData = async (req, res, next) => {
  try {
    const parentEmail = req.user.email;
    const parentId = req.user._id;

    // Dual lookup: check parentEmail on User AND parentId on Student profile
    let studentUser = await User.findOne({
      role: 'Student',
      parentEmail: parentEmail,
    });

    // If not found by email, try by Student profile parentId
    if (!studentUser) {
      const studentProfile = await Student.findOne({ parentId: parentId });
      if (studentProfile) {
        studentUser = await User.findById(studentProfile.user);
      }
    }

    if (!studentUser) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    const marks = await Mark.find({ student: studentUser._id });
    const attendance = await Attendance.find({ student: studentUser._id });
    const fees = await Fee.find({ student: studentUser._id });

    res.status(200).json({
      success: true,
      data: {
        student: studentUser,
        marks,
        attendance,
        fees
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get ALL children linked to this parent
// @route   GET /api/parent/children
// @access  Private (Parent)
exports.getChildren = async (req, res, next) => {
  try {
    const parentEmail = req.user.email;
    const parentId = req.user._id;

    // Find by parentEmail on User
    const byEmail = await User.find({
      role: 'Student',
      parentEmail: parentEmail,
    });

    // Find by parentId on Student profile
    const studentProfiles = await Student.find({ parentId: parentId }).populate('user');
    const byProfile = studentProfiles
      .filter((sp) => sp.user)
      .map((sp) => sp.user);

    // Merge and deduplicate
    const seen = new Set();
    const children = [];
    for (const child of [...byEmail, ...byProfile]) {
      const id = child._id.toString();
      if (!seen.has(id)) {
        seen.add(id);

        // Get additional data for each child
        const marks = await Mark.find({ student: child._id });
        const attendance = await Attendance.find({ student: child._id });
        const fees = await Fee.find({ student: child._id });
        const profile = await Student.findOne({ user: child._id });

        children.push({
          student: child,
          profile,
          marks,
          attendance,
          fees,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: children.length,
      data: children,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get child academic performance (Charts)
// @route   GET /api/parent/performance
// @access  Private (Parent)
exports.getPerformance = async (req, res, next) => {
  try {
    const parentEmail = req.user.email;
    const parentId = req.user._id;

    let studentUser = await User.findOne({
      role: 'Student',
      parentEmail: parentEmail,
    });

    if (!studentUser) {
      const studentProfile = await Student.findOne({ parentId: parentId });
      if (studentProfile) {
        studentUser = await User.findById(studentProfile.user);
      }
    }

    if (!studentUser) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    const marks = await Mark.aggregate([
      { $match: { student: studentUser._id } },
      {
        $group: {
          _id: '$subject',
          avgScore: { $avg: '$score' },
          totalMarks: { $first: '$totalMarks' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: marks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get class teacher for the parent's child
// @route   GET /api/parent/class-teacher
// @access  Private (Parent)
exports.getClassTeacher = async (req, res, next) => {
  try {
    const parentEmail = req.user.email;
    const parentId = req.user._id;

    let studentUser = await User.findOne({
      role: 'Student',
      parentEmail: parentEmail,
    });

    if (!studentUser) {
      const studentProfile = await Student.findOne({ parentId: parentId });
      if (studentProfile) {
        studentUser = await User.findById(studentProfile.user);
      }
    }

    if (!studentUser || !studentUser.className) {
      return res.status(404).json({ success: false, error: 'Child or class not found' });
    }

    // Find teacher allocations for the child's class
    const allocations = await TeacherAllocation.find({
      className: studentUser.className,
    }).populate('teacher', 'name email role');

    const teachers = allocations
      .filter((a) => a.teacher)
      .map((a) => a.teacher);

    // Deduplicate
    const seen = new Set();
    const uniqueTeachers = teachers.filter((t) => {
      const id = t._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    res.status(200).json({
      success: true,
      data: {
        className: studentUser.className,
        studentName: studentUser.name,
        teachers: uniqueTeachers,
      },
    });
  } catch (err) {
    next(err);
  }
};
