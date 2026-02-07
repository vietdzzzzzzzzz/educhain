const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  timeSlot: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Schedule", scheduleSchema);
