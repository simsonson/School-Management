const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date'],
  },
  class: {
    type: String,
    required: [true, 'Please add a class'],
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Homework', homeworkSchema);
