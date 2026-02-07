const router = require("express").Router();
const {
  hello,
  login,
  // User controllers
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  // Course controllers
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  // Grade controllers
  getGrades,
  getGradesByStudent,
  getGradesByCourse,
  createGrade,
  updateGrade,
  deleteGrade,
  // Announcement controllers
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  // Schedule controllers
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  // Exam controllers
  getExams,
  createExam,
  updateExam,
  deleteExam
} = require("../controllers/api.controller");

router.get("/hello", hello);

// Auth routes
router.post("/login", login);

// User routes
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Course routes
router.get("/courses", getCourses);
router.get("/courses/:id", getCourseById);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

// Grade routes
router.get("/grades", getGrades);
router.get("/grades/student/:studentId", getGradesByStudent);
router.get("/grades/course/:courseId", getGradesByCourse);
router.post("/grades", createGrade);
router.put("/grades/:id", updateGrade);
router.delete("/grades/:id", deleteGrade);

// Announcement routes
router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.put("/announcements/:id", updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

// Schedule routes
router.get("/schedules", getSchedules);
router.post("/schedules", createSchedule);
router.put("/schedules/:id", updateSchedule);
router.delete("/schedules/:id", deleteSchedule);

// Exam routes
router.get("/exams", getExams);
router.post("/exams", createExam);
router.put("/exams/:id", updateExam);
router.delete("/exams/:id", deleteExam);

module.exports = router;
