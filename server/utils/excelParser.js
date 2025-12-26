const ExcelJS = require('exceljs');
const moment = require('moment');
const { getExpectedHours, calculateWorkedHours, getAttendanceStatus } = require('./workingHours');

const parseExcelFile = async (filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    const attendanceData = [];

    // Skip header row, start from row 2
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const employeeName = row.getCell(1).value;
      const dateValue = row.getCell(2).value;
      const inTime = row.getCell(3).value;
      const outTime = row.getCell(4).value;

      if (!employeeName || !dateValue) return;

      // Parse date
      let date;
      if (dateValue instanceof Date) {
        date = moment(dateValue);
      } else if (typeof dateValue === 'string') {
        date = moment(dateValue, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']);
      } else {
        return; // Skip invalid dates
      }

      if (!date.isValid()) return;

      const dayOfWeek = date.format('dddd');
      const expectedHours = getExpectedHours(date.toDate());

      // Convert time values to string format
      const inTimeStr = inTime ? (typeof inTime === 'string' ? inTime : moment(inTime, 'HH:mm').format('HH:mm')) : null;
      const outTimeStr = outTime ? (typeof outTime === 'string' ? outTime : moment(outTime, 'HH:mm').format('HH:mm')) : null;

      const workedHours = calculateWorkedHours(inTimeStr, outTimeStr);
      const status = getAttendanceStatus(inTimeStr, outTimeStr, expectedHours, workedHours);

      attendanceData.push({
        employeeName: employeeName.toString().trim(),
        date: date.toDate(),
        inTime: inTimeStr,
        outTime: outTimeStr,
        workedHours,
        expectedHours,
        status
      });
    });

    return attendanceData;
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
};

module.exports = { parseExcelFile };