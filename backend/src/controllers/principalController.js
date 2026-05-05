const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const LeaveRequest = require('../models/LeaveRequest');

// @desc    Get school analytics
// @route   GET /api/principal/analytics
// @access  Private (Principal)
exports.getAnalytics = async (req, res, next) => {
  try {
    const studentCount = await User.countDocuments({ role: 'Student' });
    const teacherCount = await User.countDocuments({ role: 'Teacher' });
    
    // Avg Attendance
    const totalAttendance = await Attendance.countDocuments();
    const presentAttendance = await Attendance.countDocuments({ status: 'Present' });
    const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

    // Recent Leave Requests
    const leaveRequests = await LeaveRequest.find({ status: 'Pending' }).populate('user', 'name role');
    const markRows = await Mark.find().populate('student', 'name').limit(500);
    const scoreByStudent = new Map();
    for (const row of markRows) {
      if (!row.student) continue;
      const key = row.student._id.toString();
      const curr = scoreByStudent.get(key) || {
        studentId: key,
        name: row.student.name,
        obtained: 0,
        total: 0,
      };
      curr.obtained += row.score || 0;
      curr.total += row.totalMarks || 0;
      scoreByStudent.set(key, curr);
    }

    const rankedStudents = Array.from(scoreByStudent.values())
      .map((s) => ({
        ...s,
        percentage: s.total > 0 ? Number(((s.obtained / s.total) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const topStudents = rankedStudents.slice(0, 5);
    const bottomStudents = rankedStudents.slice(-5).reverse();

    const teacherPerformance = await Mark.aggregate([
      { $group: { _id: '$teacher', marksUploaded: { $sum: 1 }, avgScore: { $avg: '$score' } } },
      { $sort: { marksUploaded: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          teacherId: '$teacher._id',
          name: '$teacher.name',
          marksUploaded: 1,
          avgScore: { $round: ['$avgScore', 2] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        studentCount,
        teacherCount,
        attendanceRate: attendanceRate.toFixed(2),
        leaveRequests,
        topStudents,
        bottomStudents,
        teacherPerformance,
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/principal/leave/:id
// @access  Private (Principal)
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user.id },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Principal report overview
// @route   GET /api/principal/reports/overview
// @access  Private (Principal)
exports.getReportOverview = async (req, res, next) => {
  try {
    const studentCount = await User.countDocuments({ role: 'Student' });
    const teacherCount = await User.countDocuments({ role: 'Teacher' });
    const markAgg = await Mark.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' }, examsRecorded: { $sum: 1 } } },
    ]);
    const attendanceTotal = await Attendance.countDocuments();
    const attendancePresent = await Attendance.countDocuments({ status: 'Present' });

    res.status(200).json({
      success: true,
      data: {
        studentCount,
        teacherCount,
        examsRecorded: markAgg[0]?.examsRecorded || 0,
        avgScore: Number((markAgg[0]?.avgScore || 0).toFixed(2)),
        attendanceRate:
          attendanceTotal > 0 ? Number(((attendancePresent / attendanceTotal) * 100).toFixed(2)) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
