require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const attendanceRoutes = require("./routes/attendanceRoutes");
const Employee = require("./models/Employee");
const Attendance = require("./models/Attendance");

const app = express();

/* =======================
   DATABASE INITIALIZATION
======================= */
const initializeDatabase = async () => {
  await connectDB();

  if (process.env.NODE_ENV !== "production") {
    try {
      await Employee.collection.drop();
      await Attendance.collection.drop();
      console.log("Database collections reset (dev only)");
    } catch {
      console.log("Collections already exist");
    }
  }
};

initializeDatabase();

/* =======================
   CORS CONFIG (FIXED)
======================= */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://leave-productivity-analyzer1-black.vercel.app",
  "https://leave-productivity-analyzer.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman, curl
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight
app.options("*", cors());

/* =======================
   BODY PARSERS
======================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =======================
   ROUTES
======================= */
app.use("/api/attendance", attendanceRoutes);

/* =======================
   HEALTH CHECK
======================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* =======================
   ROOT
======================= */
app.get("/", (req, res) => {
  res.json({
    message: "Leave & Productivity Analyzer API",
    endpoints: [
      "POST /api/attendance/upload",
      "GET /api/attendance/dashboard",
      "GET /api/attendance/employees",
      "GET /api/attendance/employee/:id",
    ],
  });
});

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: err.message });
});

/* =======================
   START SERVER (RENDER)
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
