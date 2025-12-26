const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { parseExcelFile } = require('../utils/excelParser');
const { calculateEmployeeMetrics, calculateOrganizationMetrics } = require('../utils/productivityCalculator');
const fs = require('fs');

const uploadAttendance = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse Excel file
    const attendanceData = await parseExcelFile(req.file.path);

    if (attendanceData.length === 0) {
      return res.status(400).json({ error: 'No valid data found in Excel file' });
    }

    // Clear existing data
    await Employee.deleteMany({});
    await Attendance.deleteMany({});

    // Group data by employee
    const employeeMap = new Map();

    for (const record of attendanceData) {
      if (!employeeMap.has(record.employeeName)) {
        employeeMap.set(record.employeeName, []);
      }
      employeeMap.get(record.employeeName).push(record);
    }

    // Process each employee
    for (const [employeeName, records] of employeeMap) {
      // Calculate employee metrics
      const metrics = calculateEmployeeMetrics(records);

      // Create employee
      const employee = new Employee({
        name: employeeName,
        ...metrics
      });
      await employee.save();

      // Create attendance records
      const attendanceRecords = records.map(record => ({
        ...record,
        employeeId: employee._id
      }));

      await Attendance.insertMany(attendanceRecords);
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'File uploaded and processed successfully',
      employeesProcessed: employeeMap.size,
      recordsProcessed: attendanceData.length
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: error.message });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const employees = await Employee.find({});
    const attendanceRecords = await Attendance.find({});

    if (employees.length === 0) {
      return res.json({
        kpis: {
          totalEmployees: 0,
          totalExpectedHours: 0,
          totalActualHours: 0,
          averageProductivity: 0,
          totalLeavesUsed: 0,
          totalAllowedLeaves: 0
        },
        charts: {
          productivityTrend: [],
          leavesPerEmployee: [],
          workStatusDistribution: [],
          expectedVsActual: []
        }
      });
    }

    // Calculate KPIs
    const kpis = calculateOrganizationMetrics(employees, attendanceRecords);

    // Productivity trend (daily)
    const productivityTrend = await Attendance.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalExpected: { $sum: "$expectedHours" },
          totalActual: { $sum: "$workedHours" }
        }
      },
      {
        $project: {
          date: "$_id",
          productivity: {
            $cond: [
              { $eq: ["$totalExpected", 0] },
              100,
              { $multiply: [{ $divide: ["$totalActual", "$totalExpected"] }, 100] }
            ]
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Leaves per employee
    const leavesPerEmployee = employees.map(emp => ({
      name: emp.name,
      leaves: emp.totalLeaves
    }));

    // Work status distribution
    const statusCounts = await Attendance.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const workStatusDistribution = statusCounts.map(item => ({
      status: item._id,
      count: item.count
    }));

    // Expected vs Actual hours per employee
    const expectedVsActual = employees.map(emp => ({
      name: emp.name,
      expected: emp.totalExpectedHours,
      actual: emp.totalActualHours
    }));

    res.json({
      kpis,
      charts: {
        productivityTrend,
        leavesPerEmployee,
        workStatusDistribution,
        expectedVsActual
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getEmployeeData = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const attendanceRecords = await Attendance.find({ employeeId: id }).sort({ date: 1 });

    // Daily worked hours for chart
    const dailyHours = attendanceRecords.map(record => ({
      date: record.date.toISOString().split('T')[0],
      hours: record.workedHours,
      expected: record.expectedHours
    }));

    // Leave vs Present count
    const statusCounts = attendanceRecords.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const leaveVsPresent = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    res.json({
      employee,
      attendanceRecords,
      charts: {
        dailyHours,
        leaveVsPresent
      }
    });

  } catch (error) {
    console.error('Employee data error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}).select('_id name totalLeaves productivity');
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadAttendance,
  getDashboardData,
  getEmployeeData,
  getAllEmployees
};