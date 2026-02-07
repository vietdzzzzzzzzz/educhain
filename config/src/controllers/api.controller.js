const User = require("../models/User");
const Course = require("../models/Course");
const Grade = require("../models/Grade");
const Announcement = require("../models/Announcement");
const Schedule = require("../models/Schedule");
const Exam = require("../models/Exam");

exports.hello = (req, res) => {
  res.json({ message: "Hello from backend " });
};

// ============ AUTH CONTROLLERS ============

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============ USER CONTROLLERS ============

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    // Set default password if not provided
    const userData = {
      ...req.body,
      password: req.body.password || '123456'
    };
    const user = new User(userData);
    const savedUser = await user.save();
    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ COURSE CONTROLLERS ============

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "fullName email")
      .populate("students", "fullName email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacher", "fullName email")
      .populate("students", "fullName email");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("teacher", "fullName email")
     .populate("students", "fullName email");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ GRADE CONTROLLERS ============

// Get all grades
exports.getGrades = async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate("student", "fullName email")
      .populate("course", "name code");
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get grades by student ID
exports.getGradesByStudent = async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.studentId })
      .populate("course", "name code credits");
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get grades by course ID
exports.getGradesByCourse = async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate("student", "fullName email");
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new grade
exports.createGrade = async (req, res) => {
  try {
    const grade = new Grade(req.body);
    const savedGrade = await grade.save();
    res.status(201).json(savedGrade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update grade
exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("student", "fullName email")
     .populate("course", "name code");
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }
    res.json(grade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete grade
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }
    res.json({ message: "Grade deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ANNOUNCEMENT CONTROLLERS ============

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    const savedAnnouncement = await announcement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ SCHEDULE CONTROLLERS ============

exports.getSchedules = async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = studentId ? { $or: [{ student: null }, { student: studentId }] } : {};
    const schedules = await Schedule.find(filter).sort({ dayOfWeek: 1, timeSlot: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    const savedSchedule = await schedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ EXAM CONTROLLERS ============

exports.getExams = async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = studentId ? { $or: [{ student: null }, { student: studentId }] } : {};
    const exams = await Exam.find(filter).sort({ date: 1, time: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const exam = new Exam(req.body);
    const savedExam = await exam.save();
    res.status(201).json(savedExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
