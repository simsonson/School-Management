const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
      default: '',
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Class', classSchema);
