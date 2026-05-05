const mongoose = require('mongoose');

const teacherAllocationSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

teacherAllocationSchema.index({ teacher: 1, className: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAllocation', teacherAllocationSchema);
