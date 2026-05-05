const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },
  periods: [
    {
      subject: { type: String, required: true },
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    }
  ],
});

module.exports = mongoose.model('Timetable', timetableSchema);
