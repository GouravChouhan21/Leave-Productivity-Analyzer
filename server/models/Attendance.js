const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  inTime: {
    type: String,
    default: null
  },
  outTime: {
    type: String,
    default: null
  },
  workedHours: {
    type: Number,
    default: 0
  },
  expectedHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Leave', 'Partial'],
    default: 'Leave'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);