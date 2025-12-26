const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  totalExpectedHours: {
    type: Number,
    default: 0
  },
  totalActualHours: {
    type: Number,
    default: 0
  },
  totalLeaves: {
    type: Number,
    default: 0
  },
  productivity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Employee', employeeSchema);