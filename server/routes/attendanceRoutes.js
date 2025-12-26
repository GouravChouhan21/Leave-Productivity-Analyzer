const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadAttendance,
  getDashboardData,
  getEmployeeData,
  getAllEmployees
} = require('../controllers/attendanceController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.post('/upload', upload.single('file'), uploadAttendance);
router.get('/dashboard', getDashboardData);
router.get('/employees', getAllEmployees);
router.get('/employee/:id', getEmployeeData);

module.exports = router;