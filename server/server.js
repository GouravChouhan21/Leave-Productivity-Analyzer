require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const attendanceRoutes = require('./routes/attendanceRoutes');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const fs = require('fs');
const path = require('path');

const app = express();

// Connect to MongoDB and clean up indexes
const initializeDatabase = async () => {
  await connectDB();

  try {
    // Only drop collections in development
    if (process.env.NODE_ENV !== 'production') {
      await Employee.collection.drop().catch(() => { });
      await Attendance.collection.drop().catch(() => { });
      console.log('Database collections reset successfully');
    }
  } catch (error) {
    console.log('Database collections already clean or first run');
  }
};

initializeDatabase();

// Create uploads directory if it doesn't exist (for local development)
if (process.env.NODE_ENV !== 'production') {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
}

/* =========================
   ✅ FIXED CORS CONFIG
   (Only this section changed)
========================= */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      // Allow localhost (dev)
      if (origin.startsWith('http://localhost')) {
        return callback(null, true);
      }

      // Allow ALL Vercel deployments (prod & preview)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Otherwise block
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight requests
app.options('*', cors());

/* =========================
   BODY PARSERS
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Leave & Productivity Analyzer API',
    version: '1.0.0',
    endpoints: [
      'POST /api/attendance/upload',
      'GET /api/attendance/dashboard',
      'GET /api/attendance/employees',
      'GET /api/attendance/employee/:id'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// Always listen on the port for Render deployment
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Also export for Vercel compatibility
module.exports = app;
