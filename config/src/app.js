const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import controllers
const { login, getUsers } = require("./controllers/api.controller");

// Root-level API calls for frontend compatibility (MUST BE BEFORE catch-all route)
app.post("/login", login);
app.get("/users", getUsers);

// API routes
app.use("/api", require("./routes/api.route"));

// Serve frontend (educhain2/dist)
const clientPath = path.join(__dirname, "../../educhain2/dist");
app.use(express.static(clientPath));

// Catch-all route (LAST)
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});
module.exports = app;