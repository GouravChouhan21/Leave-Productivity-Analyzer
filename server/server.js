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

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
      'https://leave-productivity-analyzer.vercel.app',
      'https://leave-productivity-analyzer-git-main-chouhangourav756-7067s-projects.vercel.app',
      'https://leave-productivity-analyzer1-hu3qj4t60.vercel.app',
      'https://leave-productivity-analyzer1-f3o6x7pm2.vercel.app'
    ]
    : [
      'http://localhost:3000',
      'https://leave-productivity-analyzer1-hu3qj4t60.vercel.app',
      'https://leave-productivity-analyzer1-f3o6x7pm2.vercel.app'
    ],
  credentials: true
}));
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