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
    // Drop existing collections to avoid index conflicts
    await Employee.collection.drop().catch(() => { });
    await Attendance.collection.drop().catch(() => { });
    console.log('Database collections reset successfully');
  } catch (error) {
    console.log('Database collections already clean or first run');
  }
};

initializeDatabase();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});