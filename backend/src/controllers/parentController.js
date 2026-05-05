const Student = require('../models/Student');
const User = require('../models/User');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');

// @desc    Get child data (assuming one child for now)
// @route   GET /api/parent/child-data
// @access  Private (Parent)
exports.getChildData = async (req, res, next) => {
  try {
    // Find students where parentId is the current user
    const studentProfile = await Student.findOne({ parentId: req.user.id });
    
    if (!studentProfile) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    const studentUser = await User.findById(studentProfile.user);
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
