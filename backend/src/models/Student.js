const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  class: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
  },
  guardianName: {
    type: String,
  },
  guardianPhone: {
    type: String,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Student', studentSchema);
