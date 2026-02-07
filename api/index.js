const app = require("../config/src/app.js");
const connectDB = require("../config/db");

// Connect to database
connectDB();

// Export as Vercel serverless function
module.exports = app;
