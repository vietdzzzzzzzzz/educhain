const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ["Trắc nghiệm", "Tự luận", "Vấn đáp", "Đồ án"],
    required: true
  },
  seatNumber: {
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

module.exports = mongoose.model("Exam", examSchema);
