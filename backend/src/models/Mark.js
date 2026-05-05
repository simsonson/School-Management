const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
  },
  examName: {
    type: String,
    required: [true, 'Please add an exam name'], // e.g., Midterm, Final, Class Test
  },
  score: {
    type: Number,
    required: [true, 'Please add a score'],
  },
  totalMarks: {
    type: Number,
    default: 100,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Mark', markSchema);
